import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { campaigns: true },
    })

    if (!user || user.campaigns.length === 0) {
      return NextResponse.json({ drafts: [] })
    }

    const campaign = user.campaigns[0]

    // Fetch pending drafts
    const drafts = await prisma.draft.findMany({
      where: {
        campaignId: campaign.id,
        status: "pending",
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ drafts })
  } catch (error) {
    console.error("Failed to fetch drafts:", error)
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, status, emailBody, emailSubject } = await req.json()

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { campaigns: true },
    })

    if (!user || user.campaigns.length === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const campaign = user.campaigns[0]

    const draft = await prisma.draft.findUnique({ where: { id } })
    if (!draft || draft.campaignId !== campaign.id) {
      return NextResponse.json({ error: "Draft not found or unauthorized" }, { status: 404 })
    }

    // Update draft
    const updatedDraft = await prisma.draft.update({
      where: { id },
      data: {
        status,
        ...(emailBody    !== undefined && { emailBody }),
        ...(emailSubject !== undefined && { emailSubject }),
      },
    })

    return NextResponse.json({ success: true, draft: updatedDraft })
  } catch (error) {
    console.error("Failed to update draft:", error)
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 })
  }
}
