import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/campaigns/ping
 *
 * Called by the Python worker (db_orchestrator.py) at the end of each execution
 * cycle to record a heartbeat timestamp. No auth token needed — the worker passes
 * its own secret to prevent spoofing from external callers.
 *
 * Worker usage:
 *   import requests
 *   requests.post("https://vaultreach.ai/api/campaigns/ping",
 *       json={"campaignId": camp_id, "secret": os.getenv("WORKER_PING_SECRET")})
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { campaignId, secret } = body

  // Guard: only accept pings from our own worker
  const expectedSecret = process.env.WORKER_PING_SECRET
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId required" }, { status: 400 })
  }

  try {
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { lastPing: new Date() },
      select: { name: true, lastRunSummary: true, user: { select: { email: true } } }
    })

    // Observability: Trigger external webhook if configured
    const webhookUrl = process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL
    if (webhookUrl && campaign.lastRunSummary) {
      const summary = campaign.lastRunSummary as Record<string, unknown>
      const message = `*VaultReach Worker Heartbeat* 🟢\nCampaign: ${campaign.name} (${campaign.user.email})\nDrafts Created: ${summary.draftsCreated || 0}\nLeads Evaluated: ${summary.leadsEvaluated || 0}\nErrors: ${Array.isArray(summary.errors) ? summary.errors.length : 0}`
      
      const payload = webhookUrl.includes("discord") 
        ? { content: message } 
        : { text: message }

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(err => console.error("Failed to send webhook:", err))
    }

    return NextResponse.json({ ok: true, lastPing: new Date().toISOString() })
  } catch (_e) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
  }
}
