import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/authOptions"
import * as tls from "tls"

async function verifySMTP(email: string, password: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = tls.connect(465, "smtp.gmail.com", { servername: "smtp.gmail.com" }, () => {
      socket.write(`EHLO vaultreach.ai\r\n`)
      socket.once("data", () => {
        const encoded = Buffer.from(`\0${email}\0${password}`).toString("base64")
        socket.write(`AUTH PLAIN ${encoded}\r\n`)
        socket.once("data", (chunk) => {
          const response = chunk.toString()
          socket.destroy()
          resolve(response.startsWith("235")) // 235 = auth success
        })
      })
    })
    socket.on("error", () => resolve(false))
    socket.setTimeout(8000, () => { socket.destroy(); resolve(false) })
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { appPassword } = await req.json()
  if (!appPassword || typeof appPassword !== "string") {
    return NextResponse.json({ error: "App password is required." }, { status: 400 })
  }

  const cleanPassword = appPassword.replace(/\s/g, "")

  // Validate the App Password with a real SMTP connection attempt
  const valid = await verifySMTP(session.user.email, cleanPassword)
  if (!valid) {
    return NextResponse.json(
      { error: "SMTP connection failed. Check your App Password and ensure 2-Step Verification is enabled on your Google account." },
      { status: 422 }
    )
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  await prisma.user.update({
    where: { id: user.id },
    data: { appPassword: cleanPassword }
  })

  return NextResponse.json({ success: true })
}
