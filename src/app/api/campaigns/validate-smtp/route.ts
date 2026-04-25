import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/authOptions"

// Validate format only — live SMTP check is not possible from Vercel's serverless
// environment (port 465 is blocked). The Railway worker performs the real auth
// check on the first send cycle and will surface errors in its deploy logs.
function isValidAppPasswordFormat(password: string): boolean {
  // Google App Passwords are exactly 16 lowercase letters (no digits, no symbols)
  return /^[a-z]{16}$/.test(password)
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

  const cleanPassword = appPassword.replace(/\s/g, "").toLowerCase()

  if (!isValidAppPasswordFormat(cleanPassword)) {
    return NextResponse.json(
      { error: "Invalid format. Google App Passwords are 16 lowercase letters (e.g. abcd efgh ijkl mnop). Spaces are ignored." },
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
