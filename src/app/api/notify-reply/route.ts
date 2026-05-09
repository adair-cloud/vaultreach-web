import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/notify-reply
// Called by the Python worker when it writes a new Hot reply record.
// Sends a Resend notification email to the campaign owner AND fires the
// user-configured webhook (Zapier / HubSpot / Pipedrive etc.).
//
// Auth: WORKER_PING_SECRET header (same pattern as /api/campaigns/ping)
// Body: { leadName, leadCompany, leadTitle, leadEmail, preview, campaignId }

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-worker-secret")
  if (secret !== process.env.WORKER_PING_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { leadName, leadCompany, leadTitle, leadEmail, preview, campaignId } =
    await req.json()

  if (!campaignId) {
    return NextResponse.json({ error: "Missing campaignId" }, { status: 400 })
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { user: true },
  })

  if (!campaign || !campaign.user?.email) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
  }

  const ownerEmail = campaign.user.email
  const campaignLabel = campaign.name ?? "Your Campaign"
  const results: Record<string, string> = {}

  // ── 1. Resend notification email ──────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Hot Reply — VaultReach</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
    <div style="background:linear-gradient(135deg,#e11d48 0%,#f43f5e 100%);padding:28px 36px;">
      <div style="color:#fecdd3;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">VaultReach · Hot Reply</div>
      <h1 style="color:white;font-size:22px;font-weight:800;margin:0;">🔥 ${leadName} just replied</h1>
    </div>
    <div style="padding:28px 36px;">
      <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <div style="color:#9f1239;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Reply Preview</div>
        <p style="color:#1e293b;font-size:14px;line-height:1.6;margin:0;">&ldquo;${preview}&rdquo;</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="color:#64748b;font-size:12px;font-weight:600;padding:4px 0;width:80px;">Name</td><td style="color:#1e293b;font-size:12px;font-weight:700;">${leadName}</td></tr>
        ${leadTitle  ? `<tr><td style="color:#64748b;font-size:12px;font-weight:600;padding:4px 0;">Title</td><td style="color:#1e293b;font-size:12px;">${leadTitle}</td></tr>` : ""}
        ${leadCompany ? `<tr><td style="color:#64748b;font-size:12px;font-weight:600;padding:4px 0;">Company</td><td style="color:#1e293b;font-size:12px;">${leadCompany}</td></tr>` : ""}
        <tr><td style="color:#64748b;font-size:12px;font-weight:600;padding:4px 0;">Campaign</td><td style="color:#1e293b;font-size:12px;">${campaignLabel}</td></tr>
      </table>
      <a href="https://www.vaultreach.ai/dashboard" style="display:inline-block;background:#e11d48;color:white;font-weight:700;font-size:13px;padding:12px 24px;border-radius:10px;text-decoration:none;">View in Dashboard → Respond Now</a>
      <p style="color:#94a3b8;font-size:11px;margin:24px 0 0;line-height:1.6;">VaultReach got you the warm reply. You close it. 🤝<br/>Reply within the hour for the best conversion rate.</p>
    </div>
  </div>
</body>
</html>`

    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "VaultReach <noreply@vaultreach.ai>",
          to: [ownerEmail],
          subject: `🔥 Hot reply from ${leadName}${leadCompany ? ` at ${leadCompany}` : ""} — respond now`,
          html,
        }),
      })
      results.email = r.ok ? "sent" : `failed:${r.status}`
    } catch (err) {
      console.error("Notify-reply Resend error:", err)
      results.email = "exception"
    }
  } else {
    results.email = "skipped:no_key"
  }

  // ── 2. Webhook / Zapier fire ──────────────────────────────────────────────
  const webhookUrl = (campaign as { webhookUrl?: string | null }).webhookUrl
  if (webhookUrl) {
    try {
      const r = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event:      "hot_reply",
          campaign:   campaignLabel,
          leadName,
          leadCompany: leadCompany ?? null,
          leadTitle:   leadTitle   ?? null,
          leadEmail:   leadEmail   ?? null,
          preview,
          timestamp:  new Date().toISOString(),
        }),
      })
      results.webhook = r.ok ? "fired" : `failed:${r.status}`
    } catch (err) {
      console.error("Notify-reply webhook error:", err)
      results.webhook = "exception"
    }
  } else {
    results.webhook = "skipped:no_url"
  }

  console.log(`✅ notify-reply for campaign ${campaignId}:`, results)
  return NextResponse.json({ ok: true, results })
}
