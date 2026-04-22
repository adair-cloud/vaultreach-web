import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Find the Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: "google",
      },
    })

    if (!account) {
      return NextResponse.json({ message: "No Google account found to revoke" })
    }

    // Google's revoke endpoint accepts either access_token or refresh_token
    const tokenToRevoke = account.access_token || account.refresh_token

    if (tokenToRevoke) {
      // Ping Google to revoke the token
      try {
        const revokeRes = await fetch(`https://oauth2.googleapis.com/revoke?token=${tokenToRevoke}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })

        if (!revokeRes.ok) {
          console.warn("Google revoke endpoint returned non-OK status:", await revokeRes.text())
          // We continue anyway so we can clean up our DB
        }
      } catch (err) {
        console.error("Network error attempting to revoke Google token:", err)
      }
    }

    // Delete the account from our database to enforce fresh OAuth consent on next login
    await prisma.account.deleteMany({
      where: {
        userId: userId,
        provider: "google",
      },
    })

    // Also deactivate their campaign since they disconnected their email
    await prisma.campaign.updateMany({
      where: { userId: userId, status: "active" },
      data: { status: "inactive" }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error revoking token:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
