import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

// ─── Auth ────────────────────────────────────────────────────────────────────
// Called by Vercel Cron (Authorization: Bearer <CRON_SECRET>) or manually
// with x-worker-secret header. Both patterns accepted.
const WORKER_SECRET  = process.env.WORKER_PING_SECRET ?? ""
const OPENAI_KEY     = process.env.OPENAI_API_KEY ?? ""
const RESEND_KEY     = process.env.RESEND_API_KEY ?? ""
const BASE_URL       = process.env.NEXTAUTH_URL ?? "https://www.vaultreach.ai"

// ─── Apollo types ────────────────────────────────────────────────────────────
type ApolloPerson = {
  id: string
  first_name: string | null
  last_name: string | null
  name: string | null
  title: string | null
  email: string | null
  linkedin_url: string | null
  organization?: { name: string | null } | null
}

// ─── Refresh Gmail OAuth access token ───────────────────────────────────────
async function refreshGmailToken(
  accountId: string,
  refreshToken: string
): Promise<string | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     process.env.GOOGLE_ID ?? "",
        client_secret: process.env.GOOGLE_SECRET ?? "",
        grant_type:    "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("Token refresh failed:", res.status, errText.slice(0, 200))
      return null
    }

    const data = (await res.json()) as { access_token: string; expires_in: number }
    const newExpiry = Math.floor(Date.now() / 1000) + data.expires_in

    // Persist the new token so it's valid next run too
    await prisma.account.update({
      where: { id: accountId },
      data: {
        access_token: data.access_token,
        expires_at:   newExpiry,
      },
    })

    return data.access_token
  } catch (e) {
    console.error("Token refresh exception:", e)
    return null
  }
}

// ─── Gmail send via stored OAuth token ───────────────────────────────────────
async function sendViaGmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
  fromName: string,
  fromEmail: string
): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  try {
    // Build RFC 2822 raw email
    const emailLines = [
      `From: ${fromName} <${fromEmail}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `MIME-Version: 1.0`,
      ``,
      body,
    ]
    const raw = emailLines.join("\r\n")
    const encoded = Buffer.from(raw)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")

    const res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encoded }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return { ok: false, error: `Gmail API ${res.status}: ${errText.slice(0, 200)}` }
    }

    const data = (await res.json()) as { id: string }
    return { ok: true, messageId: data.id }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

// ─── Draft personalized email via OpenAI (radical variance engine) ───────────
async function draftEmail(
  lead: ApolloPerson,
  campaign: {
    websiteUrl: string | null
    tone: string
    rules: string | null
    targetIndustry: string
  },
  senderName: string
): Promise<{ subject: string; body: string } | null> {
  if (!OPENAI_KEY) return null

  const openai = new OpenAI({ apiKey: OPENAI_KEY })

  const rulesObj = (() => {
    try { return JSON.parse(campaign.rules ?? "{}") } catch { return {} }
  })()
  const customRules = rulesObj.custom ?? ""
  const coreOffer   = rulesObj.coreOffer ?? ""

  const firstName   = lead.first_name ?? lead.name?.split(" ")[0] ?? "there"
  const company     = lead.organization?.name ?? "their company"
  const title       = lead.title ?? "founder"

  // ── Structural variance seed ─────────────────────────────────────────────
  // Pick random patterns so every email has a different skeleton.
  const subjectPatterns = [
    `one-word or two-word subject — use the company name alone, or a single concept like "Pipeline" or "Outreach"`,
    `short, jarring observation — e.g. "10 reps. No automation." or "All manual. All day."`,
    `lowercase curiosity hook — e.g. "quick thought on ${company}" or "saw ${company} hiring"`,
    `a number-led subject — e.g. "3x pipeline, 0 extra hours" or "20 leads. 1 hour."`,
    `a single human question as subject — e.g. "is ${firstName} doing this manually?" or "worth 7 days?"`,
  ]
  const openingPatterns = [
    `Start with a specific, researched observation about ${company} or the ${title} role — something that feels like you actually looked them up.`,
    `Start with a bold assumption about a pain they definitely feel, stated as fact, not a question.`,
    `Start with a counterintuitive or surprising statement about their industry or role.`,
    `Start with a one-sentence outcome story: what happened when someone like them used this.`,
    `Start with an admission or vulnerability: something honest and unexpected that earns trust immediately.`,
  ]
  const lengthPatterns = [
    `Keep the email extremely short: 3 sentences maximum. Every word must earn its place.`,
    `Use 5-6 sentences. Give the reader enough context to feel intrigued, but not overwhelmed.`,
    `Use 4 sentences. Two for context, one for the offer, one for the CTA.`,
  ]
  const ctaVariants = [
    `I built an AI that sent you this email. Open to a 7-day free trial to see it work for ${company}?`,
    `Worth a 7-day trial to see if it fills your pipeline? (The AI that wrote this runs 24/7.)`,
    `Curious if this could work for ${company}? Happy to set up a free trial — no pitch call required.`,
    `The AI that wrote this email runs 24/7. Want to see it do the same for ${company}?`,
  ]

  // Seeded random selection — different for every lead
  const seed = (lead.id?.charCodeAt(0) ?? 0) + (lead.email?.charCodeAt(2) ?? 0)
  const pick = (arr: string[]) => arr[seed % arr.length]
  const pick2 = (arr: string[]) => arr[(seed + 2) % arr.length]
  const pick3 = (arr: string[]) => arr[(seed + 1) % arr.length]
  const pick4 = (arr: string[]) => arr[(seed + 3) % arr.length]

  const systemPrompt = `You are a world-class B2B cold email copywriter. Your single goal is to write an email that gets a REPLY — not a click, not a visit, a reply.

ABSOLUTE RULES (violating any of these makes the email worthless):
- Plain text ONLY. No HTML, no markdown, no bullet points, no em-dashes formatting.
- NEVER include a URL or website link in the email body. Not even vaultreach.ai. Not ever.
- NEVER start with the recipient's name.
- NEVER use these phrases: "I hope", "I wanted to", "touching base", "circling back", "quick question", "I noticed", "I came across", "I saw your profile", "I hope this finds you".
- ONE CTA only. The CTA must invite a reply, never a click.
- Sound like a real human founder writing from their laptop at 7am, not a marketing department.
- Tone: ${campaign.tone}.

STRUCTURAL BRIEF FOR THIS SPECIFIC EMAIL (follow this precisely):
- Subject line style: ${pick(subjectPatterns)}
- Opening line style: ${pick2(openingPatterns)}
- Length: ${pick3(lengthPatterns)}
- CTA to use verbatim: "${pick4(ctaVariants)}"

${customRules ? `ADDITIONAL RULES FROM CAMPAIGN SETTINGS:\n${customRules}` : ""}
${coreOffer ? `WHAT YOU'RE SELLING:\n${coreOffer}` : ""}`

  const userPrompt = `Write a cold email using the structural brief above.

RECIPIENT:
- Name: ${firstName}
- Title: ${title}
- Company: ${company}
- LinkedIn: ${lead.linkedin_url ?? "not available"}

SENDER: ${senderName}, Founder of VaultReach (an AI-powered outreach tool)
INDUSTRY CONTEXT: ${campaign.targetIndustry}

Respond in JSON format exactly:
{
  "subject": "<subject line — follow the style in your brief>",
  "body": "<plain text body — no URLs, no HTML, ends with the exact CTA from your brief>"
}`

  try {
    const completion = await openai.chat.completions.create({
      model:           "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens:      600,
      temperature:     1.0, // Max variance — different structure every time
    })

    const raw    = completion.choices[0]?.message?.content ?? "{}"
    const parsed = JSON.parse(raw) as { subject?: string; body?: string }
    if (!parsed.subject || !parsed.body) return null

    // Safety net: strip any URLs that snuck in despite instructions
    const cleanBody = parsed.body
      .replace(/https?:\/\/\S+/gi, "vaultreach.ai")
      .trim()

    return { subject: parsed.subject.trim(), body: cleanBody }
  } catch (e) {
    console.error("OpenAI draft error:", e)
    return null
  }
}


// ─── Fetch leads from Apollo ──────────────────────────────────────────────────
async function fetchApolloLeads(
  apolloApiKey: string,
  campaign: {
    targetIndustry: string
    targetTitles: string
    targetLocations: string
    employeeRange: string
  },
  perPage = 25
): Promise<ApolloPerson[]> {
  const titles = campaign.targetTitles
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)

  const locations = campaign.targetLocations
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean)

  // Parse employee range e.g. "11-50" → [11, 50]
  const [minEmp, maxEmp] = (campaign.employeeRange ?? "1-200")
    .split(/[-,]/)
    .map(Number)

  const payload = {
    api_key: apolloApiKey,
    page: 1,
    per_page: perPage,
    person_titles: titles.length > 0 ? titles : ["CEO", "Founder"],
    organization_locations: locations.length > 0 ? locations : ["United States"],
    // Industry keywords
    q_organization_keyword_tags: [campaign.targetIndustry].filter(Boolean),
    // Employee count range
    organization_num_employees_ranges: [`${minEmp ?? 1},${maxEmp ?? 200}`],
    // Only return contacts with verified emails
    contact_email_status: ["verified", "likely to engage"],
  }

  const res = await fetch("https://api.apollo.io/v1/mixed_people/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errText = await res.text()
    // Throw so caller can surface in runResult.errors
    throw new Error(`Apollo ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = (await res.json()) as { people?: ApolloPerson[] }
  return data.people ?? []
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Auth: accept x-worker-secret header OR Vercel Cron Bearer token
  const workerSecret  = req.headers.get("x-worker-secret")
  const cronAuth      = req.headers.get("authorization")?.replace("Bearer ", "")
  const cronSecret    = process.env.CRON_SECRET ?? WORKER_SECRET

  if (workerSecret !== WORKER_SECRET && cronAuth !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startedAt = new Date()
  const globalResults: Record<string, unknown>[] = []

  try {
    // Fetch all active campaigns with their user's Apollo key + Gmail token
    const campaigns = await prisma.campaign.findMany({
      where: { status: "active" },
      include: {
        user: {
          include: { accounts: { where: { provider: "google" } } },
        },
      },
    })

    if (campaigns.length === 0) {
      return NextResponse.json({ ok: true, message: "No active campaigns", ran: 0 })
    }

    for (const campaign of campaigns) {
      const user         = campaign.user
      const apolloApiKey = user.apolloApiKey
      const account      = user.accounts[0]
      let   accessToken  = account?.access_token ?? null
      const senderName   = user.name?.split(" ")[0] ?? "Adair"
      const senderEmail  = user.email ?? ""

      // Declare runResult early so token-refresh errors can be captured
      const runResult = {
        campaignId:     campaign.id,
        campaignName:   campaign.name,
        userEmail:      senderEmail,
        leadsEvaluated: 0,
        leadsSkipped:   0,
        draftsCreated:  0,
        emailsSent:     0,
        errors:         [] as string[],
        runAt:          startedAt.toISOString(),
      }

      // ── Auto-refresh Gmail token if expired ────────────────────────────────
      if (account && account.refresh_token) {
        const expiresAt = account.expires_at ?? 0  // Unix seconds
        const isExpired = expiresAt < Math.floor(Date.now() / 1000) + 60 // 60s buffer
        if (isExpired) {
          const newToken = await refreshGmailToken(account.id, account.refresh_token)
          if (newToken) {
            accessToken = newToken
          } else {
            runResult.errors.push("Gmail token refresh failed — re-authenticate at vaultreach.ai/login")
          }
        }
      }

      // ── Guard: need Apollo key ──────────────────────────────────────────────
      if (!apolloApiKey) {
        runResult.errors.push("No Apollo API key set for user")
        globalResults.push(runResult)
        continue
      }

      // ── Guard: need Gmail token (for sending) ───────────────────────────────
      if (!accessToken && !campaign.draftMode) {
        runResult.errors.push("No Gmail access token — connect Gmail in account settings")
      }

      // ── Check send window ───────────────────────────────────────────────────
      const now        = new Date()
      const dayOfWeek  = now.getDay() // 0=Sun, 1=Mon …
      const hourOfDay  = now.getUTCHours() // UTC; worker runs in UTC

      const sendDays   = (campaign.sendDays ?? "1,2,3,4,5")
        .split(",")
        .map(Number)

      // Only enforce send window if not in draft mode (drafts always queue)
      if (!campaign.draftMode && !sendDays.includes(dayOfWeek)) {
        runResult.leadsSkipped += 1 // just note it
        globalResults.push(runResult)
        // Still ping + trial-drip below
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { lastPing: new Date(), lastRunSummary: runResult },
        })
        continue
      }

      // ── Fetch leads from Apollo ─────────────────────────────────────────────
      let apolloLeads: ApolloPerson[] = []
      try {
        apolloLeads = await fetchApolloLeads(apolloApiKey, {
          targetIndustry:  campaign.targetIndustry,
          targetTitles:    campaign.targetTitles,
          targetLocations: campaign.targetLocations,
          employeeRange:   campaign.employeeRange,
        }, 25)
      } catch (e) {
        runResult.errors.push(`Apollo fetch failed: ${String(e)}`)
      }

      runResult.leadsEvaluated = apolloLeads.length

      // ── Dedup: filter out leads already in DB ───────────────────────────────
      const existingApolloIds = new Set(
        (await prisma.lead.findMany({
          where: { campaignId: campaign.id, apolloId: { in: apolloLeads.map((l) => l.id) } },
          select: { apolloId: true },
        })).map((l) => l.apolloId)
      )

      const existingEmails = new Set(
        (await prisma.lead.findMany({
          where: { campaignId: campaign.id, email: { in: apolloLeads.map((l) => l.email ?? "").filter(Boolean) } },
          select: { email: true },
        })).map((l) => l.email)
      )

      // Also check global suppression list
      const suppressedEmails = new Set(
        (await prisma.globalSuppression.findMany({
          where: { email: { in: apolloLeads.map((l) => l.email ?? "").filter(Boolean) } },
          select: { email: true },
        })).map((s) => s.email)
      )

      // Also check per-campaign exclusion list
      const excludedEmails = new Set(
        (await prisma.excludedLead.findMany({
          where: { campaignId: campaign.id, email: { in: apolloLeads.map((l) => l.email ?? "").filter(Boolean) } },
          select: { email: true },
        })).map((e) => e.email)
      )

      const freshLeads = apolloLeads.filter((lead) => {
        if (!lead.email) return false
        if (existingApolloIds.has(lead.id)) { runResult.leadsSkipped++; return false }
        if (existingEmails.has(lead.email)) { runResult.leadsSkipped++; return false }
        if (suppressedEmails.has(lead.email)) { runResult.leadsSkipped++; return false }
        if (excludedEmails.has(lead.email)) { runResult.leadsSkipped++; return false }
        return true
      })

      // ── Respect daily send cap ──────────────────────────────────────────────
      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)
      const sentToday = await prisma.draft.count({
        where: {
          campaignId: campaign.id,
          status:     "sent",
          sentAt:     { gte: todayStart },
        },
      })

      const remainingCap = Math.max(0, campaign.dailySendLimit - sentToday)
      const leadsToProcess = freshLeads.slice(0, remainingCap)

      // ── Process each lead ───────────────────────────────────────────────────
      for (const lead of leadsToProcess) {
        try {
          // 1. Upsert lead record
          await prisma.lead.create({
            data: {
              campaignId: campaign.id,
              email:      lead.email!,
              apolloId:   lead.id,
            },
          })

          // 2. Draft email via OpenAI
          const draft = await draftEmail(lead, campaign, senderName)
          if (!draft) {
            runResult.errors.push(`Draft failed for ${lead.email}`)
            continue
          }

          const leadFirstName = lead.first_name ?? lead.name?.split(" ")[0] ?? null
          const leadCompany   = lead.organization?.name ?? null

          // 3. Create draft record in DB
          const draftRecord = await prisma.draft.create({
            data: {
              campaignId:   campaign.id,
              leadEmail:    lead.email!,
              leadFirstName,
              leadCompany,
              leadTitle:    lead.title ?? null,
              leadLinkedIn: lead.linkedin_url ?? null,
              emailSubject: draft.subject,
              emailBody:    draft.body,
              status:       "pending",
            },
          })

          runResult.draftsCreated++

          // 4. Determine if we should send now
          const shouldSend = !campaign.draftMode ||
            (campaign.autoApproveHours !== null &&
             campaign.autoApproveHours !== undefined &&
             campaign.autoApproveHours <= 0)

          if (shouldSend && accessToken) {
            const sendResult = await sendViaGmail(
              accessToken,
              lead.email!,
              draft.subject,
              draft.body,
              senderName,
              senderEmail
            )

            if (sendResult.ok) {
              // Mark draft sent
              await prisma.draft.update({
                where: { id: draftRecord.id },
                data: { status: "sent", sentAt: new Date() },
              })

              // Update analytics
              const today = new Date()
              today.setUTCHours(0, 0, 0, 0)
              await prisma.analytics.create({
                data: {
                  campaignId: campaign.id,
                  date:       today,
                  emailsSent: 1,
                },
              })

              runResult.emailsSent++
            } else {
              runResult.errors.push(`Gmail send failed for ${lead.email}: ${sendResult.error}`)
            }
          } else if (shouldSend && !accessToken) {
            runResult.errors.push("No Gmail token — drafts created but not sent. Reconnect Gmail.")
          }
          // If draftMode=true and no autoApprove, draft just sits pending for manual review
        } catch (e) {
          runResult.errors.push(`Lead ${lead.email} error: ${String(e)}`)
        }
      }

      // ── Update campaign heartbeat ───────────────────────────────────────────
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          lastPing:       new Date(),
          lastRunSummary: runResult,
        },
      })

      // ── Fire trial-drip sequence ────────────────────────────────────────────
      try {
        await fetch(`${BASE_URL}/api/trial-drip`, {
          method: "POST",
          headers: {
            "Content-Type":    "application/json",
            "x-worker-secret": WORKER_SECRET,
          },
          body: JSON.stringify({ campaignId: campaign.id }),
        })
      } catch (e) {
        runResult.errors.push(`trial-drip failed: ${String(e)}`)
      }

      globalResults.push(runResult)
    }

    return NextResponse.json({
      ok:         true,
      ran:        campaigns.length,
      finishedAt: new Date().toISOString(),
      campaigns:  globalResults,
    })
  } catch (e) {
    console.error("Worker fatal error:", e)
    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 500 }
    )
  }
}

// ─── GET: Health check / last run info ───────────────────────────────────────
export async function GET(req: NextRequest) {
  const workerSecret = req.headers.get("x-worker-secret")
  const cronAuth     = req.headers.get("authorization")?.replace("Bearer ", "")
  const cronSecret   = process.env.CRON_SECRET ?? WORKER_SECRET

  if (workerSecret !== WORKER_SECRET && cronAuth !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const campaigns = await prisma.campaign.findMany({
    where: { status: "active" },
    select: {
      id:            true,
      name:          true,
      lastPing:      true,
      lastRunSummary: true,
      draftMode:     true,
      user:          { select: { email: true } },
    },
  })

  return NextResponse.json({ ok: true, activeCampaigns: campaigns.length, campaigns })
}
