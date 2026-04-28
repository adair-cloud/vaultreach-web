import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends a one-time welcome email to a new VaultReach user.
 * Called from the NextAuth signIn callback on first login.
 * Uses onboarding@resend.dev until vaultreach.ai domain is verified.
 */
export async function sendWelcomeEmail(toEmail: string, firstName: string) {
  const name = firstName || 'there'
  const from = 'VaultReach <hello@vaultreach.ai>'

  try {
    await resend.emails.send({
      from,
      to: toEmail,
      subject: `You're in — here's how to launch your AI SDR`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to VaultReach</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);border:1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background:#6366f1;padding:32px 40px;text-align:left;">
              <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">⚡ VaultReach</span>
              <p style="color:#c7d2fe;font-size:13px;margin:8px 0 0;font-weight:500;">Your AI Sales Development Rep</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="font-size:24px;font-weight:900;color:#0f172a;margin:0 0 8px;letter-spacing:-0.5px;">
                Welcome, ${name}! 👋
              </h1>
              <p style="font-size:15px;color:#64748b;line-height:1.6;margin:0 0 28px;">
                Your account is live. VaultReach will autonomously find qualified B2B leads, write personalized cold emails, and fill your pipeline — 24/7, without you lifting a finger.
              </p>
              <p style="font-size:14px;font-weight:700;color:#0f172a;margin:0 0 16px;">
                Complete these 3 steps to launch your AI SDR:
              </p>

              <!-- Step 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;margin-bottom:12px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="font-size:18px;">🔑</span>
                    <span style="font-size:14px;font-weight:700;color:#92400e;margin-left:10px;">Add your Apollo.io API Key</span>
                    <p style="font-size:13px;color:#92400e;margin:6px 0 0;line-height:1.5;">
                      Go to Settings in your dashboard. Create a free Apollo account at <a href="https://app.apollo.io" style="color:#6366f1;">app.apollo.io</a> → Settings → Integrations → API → Create New Key.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:12px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="font-size:18px;">🎯</span>
                    <span style="font-size:14px;font-weight:700;color:#166534;margin-left:10px;">Configure Lead Targeting</span>
                    <p style="font-size:13px;color:#166534;margin:6px 0 0;line-height:1.5;">
                      In the Lead Targeting tab, set the job titles, industry, company size, and locations you want to target.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="font-size:18px;">🚀</span>
                    <span style="font-size:14px;font-weight:700;color:#3730a3;margin-left:10px;">Launch your AI Sales Assistant</span>
                    <p style="font-size:13px;color:#3730a3;margin:6px 0 0;line-height:1.5;">
                      Hit the Launch button on the Overview tab. Your first batch of emails typically sends within 24 hours.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#6366f1;border-radius:12px;">
                    <a href="https://vaultreach.ai/dashboard" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;letter-spacing:0.2px;">
                      Go to my Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f1f5f9;">
              <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6;">
                You're receiving this because you just created a VaultReach account.<br/>
                Questions? Reply to this email — we're real humans.<br/>
                <a href="https://vaultreach.ai" style="color:#6366f1;text-decoration:none;">vaultreach.ai</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    })
    console.log(`✅ Welcome email sent to ${toEmail}`)
  } catch (err) {
    // Non-fatal — never block sign-in if email fails
    console.error(`⚠️ Welcome email failed for ${toEmail}:`, err)
  }
}
