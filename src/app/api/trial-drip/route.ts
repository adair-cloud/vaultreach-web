import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/trial-drip
// Called by the Python worker every cycle for each active campaign.
// Determines which drip email to send based on days since campaign creation,
// sends it via Resend, and records it so it never fires twice.
//
// Drip schedule (7-day Stripe trial):
//   Day 1  — "Your campaign is live — here's what's happening"
//   Day 3  — "Your first emails are going out"
//   Day 5  — "Mid-trial check-in — results so far"
//   Day 6  — "Trial ends tomorrow — ready to upgrade?"
//   Day 8  — "Your trial has ended — don't lose your momentum"
//
// Auth: WORKER_PING_SECRET header (same as /api/campaigns/ping)

const RESEND_API_KEY    = process.env.RESEND_API_KEY ?? ""
const WORKER_SECRET     = process.env.WORKER_PING_SECRET ?? ""
const BASE_URL          = process.env.NEXTAUTH_URL ?? "https://www.vaultreach.ai"
const STRIPE_PORTAL_URL = `${BASE_URL}/api/stripe/checkout`

type DripDef = {
  day: number
  type: string
  subject: string
  html: (name: string, dashboardUrl: string) => string
}

const DRIP_SEQUENCE: DripDef[] = [
  {
    day: 1,
    type: "day1",
    subject: "⚡ VaultReach is running — here's what's happening",
    html: (name, dash) => `
      <div style="max-width:520px;margin:32px auto;font-family:-apple-system,sans-serif;color:#1e293b;">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px 32px;border-radius:12px 12px 0 0;">
          <p style="color:#c7d2fe;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:0 0 6px;">VaultReach · Day 1</p>
          <h1 style="color:white;font-size:20px;font-weight:800;margin:0;">Your AI sales rep is on the clock ⚡</h1>
        </div>
        <div style="background:white;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:28px 32px;">
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Hey ${name},</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">VaultReach is now scraping qualified B2B leads from Apollo that match your ICP. Within the next 24–48 hours, personalized cold emails will start going out automatically — written by AI, sent from your Gmail, no action needed from you.</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">Your dashboard shows everything in real time: leads found, emails sent, replies received.</p>
          <a href="${dash}" style="display:inline-block;background:#4f46e5;color:white;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">View Your Dashboard →</a>
          <p style="color:#94a3b8;font-size:12px;margin:28px 0 0;line-height:1.6;">You have 7 days free. No credit card charged until your trial ends.<br/>— Adair, VaultReach</p>
        </div>
      </div>`,
  },
  {
    day: 3,
    type: "day3",
    subject: "📬 VaultReach update: your first emails are going out",
    html: (name, dash) => `
      <div style="max-width:520px;margin:32px auto;font-family:-apple-system,sans-serif;color:#1e293b;">
        <div style="background:linear-gradient(135deg,#0891b2,#0e7490);padding:24px 32px;border-radius:12px 12px 0 0;">
          <p style="color:#a5f3fc;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:0 0 6px;">VaultReach · Day 3</p>
          <h1 style="color:white;font-size:20px;font-weight:800;margin:0;">Your pipeline is filling up 📬</h1>
        </div>
        <div style="background:white;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:28px 32px;">
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Hey ${name},</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">VaultReach has been working in the background. Personalized cold emails are going out daily from your Gmail to qualified prospects that match your targeting. Every email is written specifically for each recipient — not a template blast.</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">If a prospect doesn't respond, VaultReach automatically sends a Day 3 and Day 7 follow-up. You don't have to touch anything.</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">Check your dashboard to see who's been contacted and watch for your first reply.</p>
          <a href="${dash}" style="display:inline-block;background:#0891b2;color:white;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">See Your Pipeline →</a>
          <p style="color:#94a3b8;font-size:12px;margin:28px 0 0;line-height:1.6;">4 days left in your free trial.<br/>— Adair, VaultReach</p>
        </div>
      </div>`,
  },
  {
    day: 5,
    type: "day5",
    subject: "📊 Mid-trial check-in — here's what VaultReach has done",
    html: (name, dash) => `
      <div style="max-width:520px;margin:32px auto;font-family:-apple-system,sans-serif;color:#1e293b;">
        <div style="background:linear-gradient(135deg,#059669,#047857);padding:24px 32px;border-radius:12px 12px 0 0;">
          <p style="color:#a7f3d0;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:0 0 6px;">VaultReach · Day 5</p>
          <h1 style="color:white;font-size:20px;font-weight:800;margin:0;">5 days in — check your results 📊</h1>
        </div>
        <div style="background:white;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:28px 32px;">
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Hey ${name},</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">You're 5 days into your VaultReach trial. By now you should be seeing activity on your dashboard — leads scraped, emails sent, and hopefully some replies coming in.</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Hot replies (prospects who expressed genuine interest) are flagged automatically in your Recent Replies panel. Those are the conversations worth following up on.</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">Log in and see where you stand.</p>
          <a href="${dash}" style="display:inline-block;background:#059669;color:white;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">View Results →</a>
          <p style="color:#94a3b8;font-size:12px;margin:28px 0 0;line-height:1.6;">Trial ends in 2 days. Upgrade anytime to keep the machine running.<br/>— Adair, VaultReach</p>
        </div>
      </div>`,
  },
  {
    day: 6,
    type: "day6",
    subject: "⏰ Your VaultReach trial ends tomorrow",
    html: (name, dash) => `
      <div style="max-width:520px;margin:32px auto;font-family:-apple-system,sans-serif;color:#1e293b;">
        <div style="background:linear-gradient(135deg,#d97706,#b45309);padding:24px 32px;border-radius:12px 12px 0 0;">
          <p style="color:#fde68a;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:0 0 6px;">VaultReach · Trial Ending</p>
          <h1 style="color:white;font-size:20px;font-weight:800;margin:0;">Trial ends tomorrow ⏰</h1>
        </div>
        <div style="background:white;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:28px 32px;">
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Hey ${name},</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Your free trial ends in less than 24 hours. When it ends, your campaign will pause and outreach will stop.</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">If VaultReach has been finding you leads and sending emails on autopilot, don't let momentum die. Upgrading takes 60 seconds.</p>
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
            <p style="font-size:13px;font-weight:700;color:#92400e;margin:0 0 8px;">What you keep with a paid plan:</p>
            <ul style="color:#78350f;font-size:13px;line-height:1.8;margin:0;padding-left:20px;">
              <li>Daily AI-powered lead scraping from Apollo</li>
              <li>Personalized cold emails sent from your Gmail</li>
              <li>Automatic Day 3 + Day 7 follow-up sequences</li>
              <li>Hot reply detection and instant alerts</li>
              <li>Up to 50 emails/day</li>
            </ul>
          </div>
          <a href="${STRIPE_PORTAL_URL}" style="display:inline-block;background:#d97706;color:white;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Upgrade Now — Keep the Machine Running →</a>
          <p style="color:#94a3b8;font-size:12px;margin:28px 0 0;line-height:1.6;">— Adair, VaultReach</p>
        </div>
      </div>`,
  },
  {
    day: 8,
    type: "day8",
    subject: "Your VaultReach trial has ended — here's how to continue",
    html: (name, _dash) => `
      <div style="max-width:520px;margin:32px auto;font-family:-apple-system,sans-serif;color:#1e293b;">
        <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:24px 32px;border-radius:12px 12px 0 0;">
          <p style="color:#c7d2fe;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:0 0 6px;">VaultReach · Trial Ended</p>
          <h1 style="color:white;font-size:20px;font-weight:800;margin:0;">Ready to keep going?</h1>
        </div>
        <div style="background:white;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:28px 32px;">
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Hey ${name},</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Your free trial has ended and your campaign is currently paused. The leads VaultReach found, and the conversations it started, are still in your dashboard — but new outreach has stopped.</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">Cold email works on volume and consistency. Pausing now means losing the momentum you built over the last week. Upgrading restarts everything immediately.</p>
          <a href="${STRIPE_PORTAL_URL}" style="display:inline-block;background:#4f46e5;color:white;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Restart My Campaign →</a>
          <p style="color:#94a3b8;font-size:12px;margin:28px 0 0;line-height:1.6;">Questions? Just reply to this email.<br/>— Adair, VaultReach</p>
        </div>
      </div>`,
  },
]

async function sendDripEmail(to: string, subject: string, html: string): Promise<boolean> {
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

  const { campaignId } = await req.json()
  if (!campaignId) return NextResponse.json({ error: "Missing campaignId" }, { status: 400 })

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { user: true },
  })
  if (!campaign || !campaign.user?.email) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
  }

  const user      = campaign.user
  const userEmail = user.email
  const userName  = user.name?.split(" ")[0] ?? "there"
  const dashUrl   = `${BASE_URL}/dashboard`

  // Days since campaign was created (used as trial clock)
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Fetch already-sent drip types for this user
  const alreadySent = await prisma.trialEmail.findMany({
    where: { userId: user.id },
    select: { emailType: true },
  })
  const sentTypes = new Set(alreadySent.map(r => r.emailType))

  const results: Record<string, string> = {}

  for (const drip of DRIP_SEQUENCE) {
    if (daysSinceCreated < drip.day) continue   // not time yet
    if (sentTypes.has(drip.type))   continue   // already sent

    const html = drip.html(userName, dashUrl)
    const sent = await sendDripEmail(userEmail, drip.subject, html)

    if (sent) {
      await prisma.trialEmail.create({
        data: { userId: user.id, emailType: drip.type },
      })
      results[drip.type] = "sent"
      sentTypes.add(drip.type)
    } else {
      results[drip.type] = "failed"
    }
  }

  console.log(`📧 trial-drip for campaign ${campaignId}:`, results)
  return NextResponse.json({ ok: true, daysSinceCreated, results })
}
