import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/authOptions"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      campaigns: {
        include: { analytics: true }
      }
    }
  })

  if (!user || user.campaigns.length === 0) {
    return NextResponse.json({ emailsSent: 0, replies: 0, meetings: 0 })
  }

  const allAnalytics = user.campaigns.flatMap(c => c.analytics)
  const emailsSent = allAnalytics.reduce((sum, a) => sum + a.emailsSent, 0)
  const replies = allAnalytics.reduce((sum, a) => sum + a.replies, 0)

  return NextResponse.json({ emailsSent, replies, meetings: 0 })
}
