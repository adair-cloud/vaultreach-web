import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"

// POST /api/onboarding-email
// Fires a one-time welcome/expectation-setting email to the user when their
// campaign first goes active. Called client-side (non-blocking) on activation.
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping onboarding email")
    return NextResponse.json({ skipped: true })
  }

  const firstName = session.user.name.split(" ")[0]
  const userEmail = session.user.email

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your VaultReach campaign is live</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
    <div style="background:linear-gradient(135deg,#4f46e5 0%,#6366f1 100%);padding:32px 40px;">
      <div style="color:#a5b4fc;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">VaultReach</div>
      <h1 style="color:white;font-size:24px;font-weight:800;margin:0;line-height:1.3;">Your AI sales engine just went live, ${firstName}.</h1>
    </div>
    <div style="padding:32px 40px;">
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">Here's what happens next — so you know exactly what to expect:</p>

      <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
        <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:14px;">
          <div style="background:#4f46e5;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">1</div>
          <div>
            <div style="color:#1e293b;font-weight:700;font-size:14px;">Leads are being scraped now</div>
            <div style="color:#64748b;font-size:13px;margin-top:2px;">Apollo is finding prospects matching your ICP. This runs in the background.</div>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:14px;">
          <div style="background:#4f46e5;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">2</div>
          <div>
            <div style="color:#1e293b;font-weight:700;font-size:14px;">First emails typically send within 24 hours</div>
            <div style="color:#64748b;font-size:13px;margin-top:2px;">The AI is writing personalized messages for each lead. If Draft Mode is on, they'll appear in your queue for approval.</div>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:16px;">
          <div style="background:#4f46e5;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">3</div>
          <div>
            <div style="color:#1e293b;font-weight:700;font-size:14px;">First replies usually arrive within 48–72 hours</div>
            <div style="color:#64748b;font-size:13px;margin-top:2px;">When a prospect responds, VaultReach scores the reply and surfaces it in your dashboard. You close the deal.</div>
          </div>
        </div>
      </div>

      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">You don't need to do anything right now. Check back in 24 hours — your dashboard will show you exactly what the AI has been doing.</p>

      <a href="https://www.vaultreach.ai/dashboard" style="display:inline-block;background:#4f46e5;color:white;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">View Your Dashboard →</a>

      <p style="color:#94a3b8;font-size:12px;margin:32px 0 0;">If your bounce rate rises above 5%, VaultReach will alert you directly on the dashboard. Make sure your domain's SPF and DKIM records are configured.</p>
    </div>
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 40px;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">VaultReach · <a href="https://www.vaultreach.ai" style="color:#94a3b8;">vaultreach.ai</a></p>
    </div>
  </div>
</body>
</html>`

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "VaultReach <noreply@vaultreach.ai>",
        to: [userEmail],
        subject: `Your AI sales engine is live, ${firstName} ⚡`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Resend error:", err)
      return NextResponse.json({ error: "Failed to send" }, { status: 500 })
    }

    console.log(`✅ Onboarding email sent to ${userEmail}`)
    return NextResponse.json({ sent: true })
  } catch (err) {
    console.error("Onboarding email exception:", err)
    return NextResponse.json({ error: "Exception" }, { status: 500 })
  }
}
