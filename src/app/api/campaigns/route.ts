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
  // Expose whether the user has set an app password (don't send the actual password for security, just a boolean)
  const hasAppPassword = !!user.appPassword
  return NextResponse.json({ campaign, hasAppPassword })
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
    timezone,
    sendWindowStart,
    sendWindowEnd,
    sendDays,
    draftMode,
  } = body

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const existing = await prisma.campaign.findFirst({ where: { userId: user.id } })

  // Gate: only users with an active Stripe subscription can create an active campaign.
  // Existing campaigns (updates) are always allowed through — the subscription was
  // validated at creation time. This prevents API-level paywall bypass.
  if (!existing && !user.stripeSubscriptionId) {
    return NextResponse.json(
      { error: "An active subscription is required to launch a campaign.", code: "SUBSCRIPTION_REQUIRED" },
      { status: 402 }
    )
  }

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
        ...(timezone        !== undefined && { timezone }),
        ...(sendWindowStart !== undefined && { sendWindowStart }),
        ...(sendWindowEnd   !== undefined && { sendWindowEnd }),
        ...(sendDays        !== undefined && { sendDays }),
        ...(draftMode       !== undefined && { draftMode }),
      },
    })
    
    // Also update User if appPassword is provided (typically from the overview/setup tab)
    if (body.appPassword !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: { appPassword: body.appPassword }
      })
    }
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
        timezone:        timezone        ?? "America/New_York",
        sendWindowStart: sendWindowStart ?? 9,
        sendWindowEnd:   sendWindowEnd   ?? 17,
        sendDays:        sendDays        ?? "1,2,3,4,5",
        draftMode:       draftMode       ?? true,
        status:          "inactive",
      },
    })
  }

  return NextResponse.json({ campaign })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { status } = await req.json()
  if (!["active", "inactive"].includes(status)) {
    return NextResponse.json({ error: "Invalid status. Must be 'active' or 'inactive'." }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // Prevent reactivation without an active subscription
  if (status === "active" && !user.stripeSubscriptionId) {
    return NextResponse.json(
      { error: "An active subscription is required.", code: "SUBSCRIPTION_REQUIRED" },
      { status: 402 }
    )
  }

  const campaign = await prisma.campaign.findFirst({ where: { userId: user.id } })
  if (!campaign) return NextResponse.json({ error: "No campaign found" }, { status: 404 })

  const updated = await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status },
  })

  return NextResponse.json({ campaign: updated })
}
