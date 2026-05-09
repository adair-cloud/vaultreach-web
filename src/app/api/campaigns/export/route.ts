import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/prisma"

// GET /api/campaigns/export?format=csv|json
// Exports all contacted leads for the user's campaign
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const format = searchParams.get("format") ?? "csv"

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { campaigns: true },
  })

  if (!user || !user.campaigns[0]) {
    return NextResponse.json({ error: "No campaign found" }, { status: 404 })
  }

  const campaign = user.campaigns[0]

  // Fetch all non-pending drafts (approved + sent = actually contacted)
  const drafts = await prisma.draft.findMany({
    where: {
      campaignId: campaign.id,
      status: { in: ["approved", "sent"] },
    },
    orderBy: { createdAt: "asc" },
  })

  if (format === "json") {
    return NextResponse.json({
      campaign: campaign.name ?? "My Campaign",
      totalContacted: drafts.length,
      leads: drafts.map((d) => ({
        firstName:   d.leadFirstName ?? "",
        company:     d.leadCompany  ?? "",
        email:       d.leadEmail,
        title:       d.leadTitle    ?? "",
        emailSubject: d.emailSubject ?? "",
        followUpNum: d.followUpNum  ?? 0,
        status:      d.status,
        sentAt:      d.sentAt ?? d.updatedAt,
      })),
    })
  }

  // Default: CSV
  const rows = [
    ["First Name", "Company", "Email", "Title", "Subject Line", "Follow-up #", "Status", "Date Sent"],
    ...drafts.map((d) => [
      d.leadFirstName ?? "",
      d.leadCompany  ?? "",
      d.leadEmail,
      d.leadTitle    ?? "",
      d.emailSubject ?? "",
      String(d.followUpNum ?? 0),
      d.status,
      (d.sentAt ?? d.updatedAt).toISOString().split("T")[0],
    ]),
  ]

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="vaultreach-leads-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}
