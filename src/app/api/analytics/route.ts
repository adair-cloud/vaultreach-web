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
        include: {
          analytics: true,
          replies: {
            orderBy: { receivedAt: "desc" },
            take: 5,
          },
        },
      },
    },
  })

  if (!user || user.campaigns.length === 0) {
    return NextResponse.json({ emailsSent: 0, replies: 0, meetings: 0, recentReplies: [] })
  }

  const campaign = user.campaigns[0]
  const allAnalytics = campaign.analytics

  const emailsSent = allAnalytics.reduce((sum, a) => sum + a.emailsSent, 0)
  const replies    = allAnalytics.reduce((sum, a) => sum + a.replies, 0)
  const meetings   = allAnalytics.reduce((sum, a) => sum + a.meetings, 0)

  // Map Reply records to the shape the dashboard UI expects
  const recentReplies = campaign.replies.map((r) => ({
    name:      r.senderName,
    role:      r.senderRole ?? "",
    preview:   r.preview,
    score:     r.score,
    time:      formatRelativeTime(r.receivedAt),
  }))

  return NextResponse.json({ emailsSent, replies, meetings, recentReplies })
}

/** Converts a Date to a human-readable relative string, e.g. "2h ago", "1d ago". */
function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 60)  return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24)   return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}
