import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

// App Router: force dynamic so Next.js doesn't cache this route
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const status = subscription.status

      if (status === "active" || status === "trialing") {
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { stripeSubscriptionId: subscription.id }
        })
      }
      break
    }

    case "checkout.session.completed": {
      // A new client just paid. Find their user record and create a Campaign
      // row in inactive state so the worker doesn't start sending before they
      // configure their ICP. The dashboard will prompt them to complete setup.
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
        include: { campaigns: true }
      })

      if (user && user.campaigns.length === 0) {
        await prisma.campaign.create({
          data: {
            userId:          user.id,
            status:          "inactive", // Client must complete ICP setup first
            targetIndustry:  "",
            targetTitles:    "founder,ceo,owner",
            employeeRange:   "1,200",
            targetLocations: "United States",
            websiteUrl:      "",
            tone:            "professional",
          }
        })
        console.log(`✅ Campaign auto-created for new subscriber: ${user.email}`)
      }
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Nullify subscription ID and deactivate all campaigns
      const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
      if (user) {
        await prisma.campaign.updateMany({
          where: { userId: user.id },
          data: { status: "inactive" }
        })
      }
      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { stripeSubscriptionId: null }
      })
      break
    }

    case "customer.subscription.trial_will_end": {
      // Stripe fires this 72 hours before trial ends. Send a final upgrade push.
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const trialEnd = subscription.trial_end ?? 0
      const trialEndDate = new Date(trialEnd * 1000).toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric"
      })

      const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
      if (user?.email && process.env.RESEND_API_KEY) {
        const firstName = user.name?.split(" ")[0] ?? "there"
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Adair at VaultReach <adair@vaultreach.ai>",
            to: [user.email],
            subject: `⏰ Your VaultReach trial ends ${trialEndDate} — upgrade to keep going`,
            html: `
              <div style="max-width:520px;margin:32px auto;font-family:-apple-system,sans-serif;color:#1e293b;">
                <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:24px 32px;border-radius:12px 12px 0 0;">
                  <p style="color:#fecaca;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:0 0 6px;">VaultReach · Trial Ending Soon</p>
                  <h1 style="color:white;font-size:20px;font-weight:800;margin:0;">72 hours left on your trial ⏰</h1>
                </div>
                <div style="background:white;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:28px 32px;">
                  <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Hey ${firstName},</p>
                  <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Your VaultReach free trial ends on <strong>${trialEndDate}</strong>. After that, your campaign will automatically pause and outreach will stop.</p>
                  <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">If you've seen leads coming in and emails going out on autopilot — that's the product working. Upgrading keeps it running continuously, with no action required from you.</p>
                  <a href="${process.env.NEXTAUTH_URL ?? "https://www.vaultreach.ai"}/api/stripe/checkout" style="display:inline-block;background:#dc2626;color:white;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Upgrade Before Trial Ends →</a>
                  <p style="color:#94a3b8;font-size:12px;margin:28px 0 0;line-height:1.6;">Questions? Just reply to this email.<br/>— Adair, VaultReach</p>
                </div>
              </div>`,
          }),
        })
        console.log(`📧 trial_will_end email sent to ${user.email}`)
      }
      break
    }

    default:
      break

  }

  return NextResponse.json({ received: true })
}
