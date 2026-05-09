import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/prisma"

// Helper: get the user's first campaign (temporary until multi-campaign UI ships)
async function getUserCampaign(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { campaigns: true },
  })
  if (!user || !user.campaigns[0]) return null
  return { user, campaign: user.campaigns[0] }
}

// GET — list all excluded leads for this campaign
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await getUserCampaign(session.user.email)
  if (!result) return NextResponse.json({ excludedLeads: [] })

  const excludedLeads = await prisma.excludedLead.findMany({
    where: { campaignId: result.campaign.id },
    orderBy: { excludedAt: "desc" },
  })

  return NextResponse.json({ excludedLeads })
}

// POST — add a lead to the exclusion list
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { email, reason } = await req.json()
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const result = await getUserCampaign(session.user.email)
  if (!result) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
  }

  try {
    const excluded = await prisma.excludedLead.create({
      data: {
        id: crypto.randomUUID(),
        campaignId: result.campaign.id,
        email: email.trim().toLowerCase(),
        reason: reason ?? "manual",
      },
    })
    return NextResponse.json({ success: true, excluded })
  } catch {
    // Unique constraint — already excluded
    return NextResponse.json({ success: true, message: "Already excluded" })
  }
}

// DELETE — remove a lead from the exclusion list
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { email } = await req.json()
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const result = await getUserCampaign(session.user.email)
  if (!result) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
  }

  await prisma.excludedLead.deleteMany({
    where: {
      campaignId: result.campaign.id,
      email: email.trim().toLowerCase(),
    },
  })

  return NextResponse.json({ success: true })
}
