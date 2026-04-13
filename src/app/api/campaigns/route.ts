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
    include: { campaigns: { include: { analytics: true } } },
  })

  if (!user) return NextResponse.json({ campaign: null })

  const campaign = user.campaigns[0] ?? null
  return NextResponse.json({ campaign })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const {
    websiteUrl,
    targetIndustry,
    targetTitles,
    employeeRange,
    targetLocations,
    // AI Brain fields — now stored in their own dedicated columns
    tone,
    rules,
  } = body

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const existing = await prisma.campaign.findFirst({ where: { userId: user.id } })

  let campaign
  if (existing) {
    // Selectively merge: only update fields that are actually provided in this request.
    // This means saving from the "Lead Targeting" tab won't wipe the AI Brain tone/rules,
    // and saving from the "AI Brain" tab won't wipe ICP fields.
    campaign = await prisma.campaign.update({
      where: { id: existing.id },
      data: {
        ...(websiteUrl      !== undefined && { websiteUrl }),
        ...(targetIndustry  !== undefined && { targetIndustry }),
        ...(targetTitles    !== undefined && { targetTitles }),
        ...(employeeRange   !== undefined && { employeeRange }),
        ...(targetLocations !== undefined && { targetLocations }),
        ...(tone            !== undefined && { tone }),
        ...(rules           !== undefined && { rules }),
      },
    })
  } else {
    campaign = await prisma.campaign.create({
      data: {
        userId:          user.id,
        websiteUrl:      websiteUrl      ?? "",
        targetIndustry:  targetIndustry  ?? "",
        targetTitles:    targetTitles    ?? "",
        employeeRange:   employeeRange   ?? "1-50",
        targetLocations: targetLocations ?? "",
        tone:            tone            ?? "professional",
        rules:           rules           ?? null,
        status:          "active",
      },
    })
  }

  return NextResponse.json({ campaign })
}
