import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/debug-apollo
 *
 * Tests the Apollo API key stored for the authenticated user.
 * Returns the raw Apollo response (first 3 leads) plus diagnostic info.
 * Owner-only endpoint — never exposed to regular users.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const OWNER_EMAILS = ["adair@vaultreach.ai", "adair.clark@gmail.com"]
  if (!OWNER_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      campaigns: true,
      accounts:  { where: { provider: "google" } },
    },
  })

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const campaign    = user.campaigns[0]
  const apolloKey   = user.apolloApiKey
  const account     = user.accounts[0]
  const tokenExpiry = account?.expires_at
    ? new Date(account.expires_at * 1000).toISOString()
    : "unknown"
  const tokenExpired = account?.expires_at
    ? account.expires_at < Math.floor(Date.now() / 1000)
    : true

  // Test Apollo
  let apolloStatus = "not_tested"
  let apolloError  = null as string | null
  let apolloLeadCount = 0
  let apolloSample = [] as unknown[]

  if (apolloKey) {
    try {
      const payload = {
        api_key:       apolloKey,
        page:          1,
        per_page:      3,
        person_titles: ["CEO", "Founder", "Co-Founder"],
        organization_locations: ["United States"],
        q_organization_keyword_tags: ["SaaS"],
        organization_num_employees_ranges: ["1,50"],
        contact_email_status: ["verified", "likely to engage"],
      }

      const res = await fetch("https://api.apollo.io/v1/mixed_people/search", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body:    JSON.stringify(payload),
      })

      const text = await res.text()

      if (!res.ok) {
        apolloStatus = "error"
        apolloError  = `HTTP ${res.status}: ${text.slice(0, 300)}`
      } else {
        const data = JSON.parse(text) as { people?: unknown[]; pagination?: unknown }
        apolloLeadCount = (data.people ?? []).length
        apolloSample    = (data.people ?? []).map((p: any) => ({
          name:   p.name,
          title:  p.title,
          email:  p.email ? `${p.email.slice(0, 3)}***` : null,
          company: p.organization?.name,
        }))
        apolloStatus = apolloLeadCount > 0 ? "ok" : "empty_results"
      }
    } catch (e) {
      apolloStatus = "exception"
      apolloError  = String(e)
    }
  } else {
    apolloStatus = "no_key"
    apolloError  = "No Apollo API key set for this user"
  }

  return NextResponse.json({
    apollo: {
      keySet:       !!apolloKey,
      keyPreview:   apolloKey ? `${apolloKey.slice(0, 8)}...` : null,
      status:       apolloStatus,
      error:        apolloError,
      leadsReturned: apolloLeadCount,
      sampleLeads:  apolloSample,
    },
    gmail: {
      tokenSet:     !!account?.access_token,
      refreshTokenSet: !!account?.refresh_token,
      tokenExpiry,
      tokenExpired,
    },
    campaign: campaign
      ? {
          id:              campaign.id,
          name:            campaign.name,
          status:          campaign.status,
          draftMode:       campaign.draftMode,
          autoApproveHours: campaign.autoApproveHours,
          targetIndustry:  campaign.targetIndustry,
          targetTitles:    campaign.targetTitles,
          lastPing:        campaign.lastPing,
        }
      : null,
  })
}
