import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/weekly-digest
// Called by the Python worker on Mondays only.
// Sends a "here's what VaultReach did for you last week" email to every
// user with an active PAID subscription (status = active, not trialing).
//
// Queries 7-day rolling stats per campaign from the Analytics + Lead + Reply tables.
// Uses Resend. Deduped by ISO week number stored on Campaign.lastDigestWeek.
//
// Auth: x-worker-secret header

const RESEND_API_KEY  = process.env.RESEND_API_KEY  ?? ""
const WORKER_SECRET   = process.env.WORKER_PING_SECRET ?? ""
const BASE_URL        = process.env.NEXTAUTH_URL ?? "https://www.vaultreach.ai"
const STRIPE_PORTAL   = `${BASE_URL}/api/stripe/checkout`

function isoWeek(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  const wk = 1 + Math.round(
    ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
  )
  return `${d.getFullYear()}-W${String(wk).padStart(2, "0")}`
}

function buildDigestHtml(
  firstName: string,
  weekLabel: string,
  stats: { leadsScraped: number; emailsSent: number; replies: number; hotReplies: number }
): string {
  const { leadsScraped, emailsSent, replies, hotReplies } = stats
  const hasActivity = emailsSent > 0 || leadsScraped > 0

  const summaryLine = hasActivity
    ? `Last week, VaultReach sent <strong>${emailsSent} personalized email${emailsSent !== 1 ? "s" : ""}</strong> on your behalf to ${leadsScraped} qualified B2B prospects — with zero effort from you.`
    : `Your campaign is configured and ready. VaultReach will begin scraping leads and sending emails as soon as your Apollo key is verified and your campaign is active.`

  const hotBlock = hotReplies > 0
    ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:0 0 24px;">
        <p style="font-size:13px;font-weight:700;color:#92400e;margin:0 0 6px;">🔥 ${hotReplies} Hot Lead${hotReplies !== 1 ? "s" : ""} This Week</p>
        <p style="font-size:13px;color:#78350f;margin:0;line-height:1.6;">These prospects replied with genuine interest. Check your dashboard to follow up.</p>
       </div>`
    : ""

  return `
    <div style="max-width:520px;margin:32px auto;font-family:-apple-system,sans-serif;color:#1e293b;">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px 32px;border-radius:12px 12px 0 0;">
        <p style="color:#c7d2fe;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:0 0 6px;">VaultReach · Weekly Digest</p>
        <h1 style="color:white;font-size:20px;font-weight:800;margin:0;">Your week in review — ${weekLabel}</h1>
      </div>
      <div style="background:white;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:28px 32px;">
        <p style="font-size:15px;line-height:1.7;margin:0 0 20px;">Hey ${firstName},</p>
        <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">${summaryLine}</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 24px;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;text-align:center;">
            <p style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 4px;">${leadsScraped}</p>
            <p style="font-size:12px;color:#64748b;margin:0;font-weight:600;">LEADS SCRAPED</p>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;text-align:center;">
            <p style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 4px;">${emailsSent}</p>
            <p style="font-size:12px;color:#64748b;margin:0;font-weight:600;">EMAILS SENT</p>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;text-align:center;">
            <p style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 4px;">${replies}</p>
            <p style="font-size:12px;color:#64748b;margin:0;font-weight:600;">REPLIES</p>
          </div>
          <div style="background:${hotReplies > 0 ? "#fef3c7" : "#f8fafc"};border:1px solid ${hotReplies > 0 ? "#fde68a" : "#e2e8f0"};border-radius:10px;padding:16px 20px;text-align:center;">
            <p style="font-size:28px;font-weight:800;color:${hotReplies > 0 ? "#92400e" : "#0f172a"};margin:0 0 4px;">${hotReplies}</p>
            <p style="font-size:12px;color:${hotReplies > 0 ? "#b45309" : "#64748b"};margin:0;font-weight:600;">🔥 HOT LEADS</p>
          </div>
        </div>

        ${hotBlock}

        <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#4f46e5;color:white;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;margin-bottom:24px;">View Full Dashboard →</a>

        <div style="border-top:1px solid #f1f5f9;padding-top:20px;margin-top:8px;">
          <p style="font-size:13px;color:#64748b;margin:0 0 8px;">Your campaign is running on autopilot. No action needed — VaultReach handles everything.</p>
          <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6;">
            Manage subscription · <a href="${STRIPE_PORTAL}" style="color:#94a3b8;">Billing</a><br/>
            — Adair, VaultReach
          </p>
        </div>
      </div>
    </div>`
}

async function sendDigest(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) return false
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Adair at VaultReach <adair@vaultreach.ai>",
        to: [to],
        subject,
        html,
      }),
    })
    return r.ok
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-worker-secret")
  if (secret !== WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const thisWeek = isoWeek(new Date())

  // Only paid, active users (not trialing — they get the trial drip instead)
  const activeCampaigns = await prisma.campaign.findMany({
    where: { status: "active" },
    include: { user: true },
  })

  // Filter to paid subscribers only (have a stripeSubscriptionId)
  const paid = activeCampaigns.filter(c =>
    c.user?.stripeSubscriptionId && c.user?.email
  )

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const results: Record<string, string> = {}

  for (const campaign of paid) {
    const user = campaign.user!

    // Check if digest already sent this week (stored in lastRunSummary as a hack-free approach)
    // We use a dedicated field approach — check if lastDigestWeek is on the campaign JSON
    const summary = campaign.lastRunSummary as Record<string, unknown> | null
    if (summary?.lastDigestWeek === thisWeek) {
      results[campaign.id] = "already_sent_this_week"
      continue
    }

    // 7-day rolling stats
    const [leadsScraped, emailsSent, replies, hotReplies] = await Promise.all([
      prisma.lead.count({
        where: { campaignId: campaign.id, lastContacted: { gte: sevenDaysAgo } },
      }),
      prisma.draft.count({
        where: { campaignId: campaign.id, status: "sent", sentAt: { gte: sevenDaysAgo } },
      }),
      prisma.reply.count({
        where: { campaignId: campaign.id, receivedAt: { gte: sevenDaysAgo } },
      }),
      prisma.reply.count({
        where: { campaignId: campaign.id, score: "Hot", receivedAt: { gte: sevenDaysAgo } },
      }),
    ])

    const firstName  = user.name?.split(" ")[0] ?? "there"
    const weekLabel  = thisWeek.replace("-W", " · Week ")
    const subject    = `📊 Your VaultReach week in review — ${leadsScraped} leads, ${emailsSent} emails sent`
    const html       = buildDigestHtml(firstName, weekLabel, { leadsScraped, emailsSent, replies, hotReplies })

    const sent = await sendDigest(user.email!, subject, html)

    if (sent) {
      // Record this week's digest in lastRunSummary to prevent double-send
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          lastRunSummary: {
            ...(summary ?? {}),
            lastDigestWeek: thisWeek,
            lastDigestSentAt: new Date().toISOString(),
          },
        },
      })
      results[campaign.id] = `sent → ${user.email}`
    } else {
      results[campaign.id] = "send_failed"
    }
  }

  console.log(`📧 weekly-digest (${thisWeek}):`, results)
  return NextResponse.json({ ok: true, week: thisWeek, results })
}
