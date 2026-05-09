import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/prisma"

// POST /api/drafts/bulk-approve
// Body: { ids: string[] }
// Approves all specified draft IDs in one DB call (validates ownership)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { ids } = await req.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 })
  }

  // Verify all drafts belong to this user's campaign
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { campaigns: true },
  })

  if (!user || !user.campaigns[0]) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
  }

  const campaignId = user.campaigns[0].id

  // Batch update — only approve drafts that belong to this campaign
  const result = await prisma.draft.updateMany({
    where: {
      id: { in: ids },
      campaignId,
      status: "pending",  // only pending drafts can be approved
    },
    data: { status: "approved" },
  })

  return NextResponse.json({
    success: true,
    approved: result.count,
    skipped: ids.length - result.count,
  })
}
