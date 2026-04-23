import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 1. Find the core user
    const user = await prisma.user.findUnique({
      where: { email: 'adair.clark@gmail.com' },
      include: { accounts: true }
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" })
    }

    // 2. Delete ALL associated accounts so the bad link is destroyed
    await prisma.account.deleteMany({
      where: { userId: user.id }
    })

    // 3. Delete any ghost adair@vaultreach.ai users to prevent collisions
    await prisma.user.deleteMany({
      where: { email: 'adair@vaultreach.ai' }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Database wiped clean. You may now log in securely." 
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) })
  }
}
