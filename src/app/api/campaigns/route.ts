    targetLocations,
    // AI Brain fields — now stored in their own dedicated columns
    tone,
    rules,
    timezone,
    sendWindowStart,
    sendWindowEnd,
    sendDays,
    draftMode,
    autoApproveHours,
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
        // ICP fields: guard against undefined (field not sent in request) but allow empty
        // string so the user can intentionally clear a field. Previously the trim() !== ''
        // guard meant a save with zero industries selected would silently skip the DB write.
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
        ...(autoApproveHours !== undefined && { autoApproveHours: autoApproveHours === null ? null : Number(autoApproveHours) }),
      },
    })
    
    // Update User API key or onboarding status
    if (body.apolloApiKey !== undefined || hasOnboarded !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(body.apolloApiKey !== undefined && { apolloApiKey: body.apolloApiKey }),
          ...(hasOnboarded !== undefined ? { hasOnboarded } : (body.apolloApiKey && { hasOnboarded: true })),
        }
      })
    }
  return NextResponse.json(campaign)
  }
