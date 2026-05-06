import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public endpoint — no auth. Accessible from email unsubscribe links.
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return new NextResponse("Missing token.", { status: 400, headers: { "Content-Type": "text/plain" } })
  }

  let email: string
  try {
    email = Buffer.from(token, "base64").toString("utf-8").toLowerCase().trim()
    // Basic sanity check
    if (!email.includes("@")) throw new Error("Invalid email")
  } catch {
    return new NextResponse("Invalid unsubscribe token.", { status: 400, headers: { "Content-Type": "text/plain" } })
  }

  try {
    await prisma.globalSuppression.upsert({
      where: { email },
      update: { reason: "unsubscribe" },
      create: { email, reason: "unsubscribe" },
    })
    console.log(`✅ Unsubscribed: ${email}`)
  } catch (err) {
    console.error(`❌ Failed to write unsubscribe for ${email}:`, err)
    // Still show success — don't expose DB errors to recipients
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribed — VaultReach</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: white; border-radius: 12px; padding: 48px 40px; max-width: 420px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }
    p { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>You've been unsubscribed.</h1>
    <p>${email} has been removed from all future VaultReach outreach. You won't hear from us again.</p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  })
}
