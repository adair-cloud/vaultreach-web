import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/prisma"

// ─── GET: load current campaign + user settings ───────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { campaigns: true },
  })

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const campaign = user.campaigns[0] ?? null

  return NextResponse.json({
    campaign,
    apolloApiKey: user.apolloApiKey ?? null,
    hasOnboarded: user.hasOnboarded,
  })
}

// ─── PATCH: toggle campaign active/inactive status ───────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { status } = body

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { campaigns: true },
  })

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (!user.campaigns[0]) return NextResponse.json({ error: "No campaign found" }, { status: 404 })

  // Subscription gate: only block on activation, not deactivation
  const isOwner = user.email === "adair@vaultreach.ai"
  if (status === "active" && !user.stripeSubscriptionId && !isOwner) {
    return NextResponse.json(
      { error: "An active subscription is required to activate a campaign.", code: "SUBSCRIPTION_REQUIRED" },
      { status: 402 }
    )
  }

  const campaign = await prisma.campaign.update({
    where: { id: user.campaigns[0].id },
    data: { ...(status !== undefined && { status }) },
  })

  return NextResponse.json(campaign)
}

// ─── POST: save campaign fields + user API key / onboarding state ─────────────
export async function POST(req: NextRequest) {
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
    // AI Brain fields — stored in dedicated columns
    tone,
    rules,
    // Scheduling
    timezone,
    sendWindowStart,
    sendWindowEnd,
    sendDays,
    // Draft / sending mode
    draftMode,
    autoApproveHours,
    // Daily send cap
    dailySendLimit,
    // Webhook / Zapier
    webhookUrl,
    // Campaign identity
    name,
    // Onboarding
    hasOnboarded,
  } = body

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const existing = await prisma.campaign.findFirst({ where: { userId: user.id } })

  // Gate: only users with an active Stripe subscription can create an active campaign.
  // Existing campaigns (updates) are always allowed through — the subscription was
  // validated at creation time. This prevents API-level paywall bypass.
  // Owner account bypasses the subscription gate (mirrors the UI-level bypass in layout.tsx).
  const isOwner = user.email === "adair@vaultreach.ai"
  if (!existing && !user.stripeSubscriptionId && !isOwner) {
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
        // ICP fields: guard against undefined (field not sent) but allow empty string
        // so the user can intentionally clear a field.
        ...(websiteUrl      !== undefined && { websiteUrl }),
        ...(targetIndustry  !== undefined && { targetIndustry }),
        ...(targetTitles    !== undefined && { targetTitles }),
        ...(targetLocations !== undefined && { targetLocations }),
        // Non-ICP fields: safe to overwrite (have sensible defaults)
        ...(employeeRange   !== undefined && { employeeRange }),
        ...(tone            !== undefined && { tone }),
        ...(rules           !== undefined && { rules }),
        ...(timezone        !== undefined && { timezone }),
        ...(sendWindowStart !== undefined && { sendWindowStart }),
        ...(sendWindowEnd   !== undefined && { sendWindowEnd }),
        ...(sendDays        !== undefined && { sendDays }),
        ...(draftMode       !== undefined && { draftMode }),
        ...(autoApproveHours !== undefined && {
          autoApproveHours: autoApproveHours === null ? null : Number(autoApproveHours),
        }),
        ...(dailySendLimit  !== undefined && { dailySendLimit: Number(dailySendLimit) }),
        ...(webhookUrl      !== undefined && { webhookUrl: webhookUrl || null }),
        ...(name            !== undefined && name.trim() && { name: name.trim() }),
      },
    })

    // Update User-level fields: Apollo API key and/or onboarding flag
    if (body.apolloApiKey !== undefined || hasOnboarded !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(body.apolloApiKey !== undefined && { apolloApiKey: body.apolloApiKey }),
          ...(hasOnboarded !== undefined
            ? { hasOnboarded }
            : (body.apolloApiKey && { hasOnboarded: true })),
        },
      })
    }
  } else {
    // Create new campaign shell for first-time users
    campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        targetIndustry: targetIndustry ?? "",
        targetTitles:   targetTitles   ?? "",
        employeeRange:  employeeRange  ?? "1-50",
        targetLocations: targetLocations ?? "",
        websiteUrl:     websiteUrl     ?? "",
        tone:           tone           ?? "professional",
        rules:          rules          ?? null,
      },
    })
  }

  return NextResponse.json(campaign)
}
