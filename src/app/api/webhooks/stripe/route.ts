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

      if (status === "active") {
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

    default:
      break
  }

  return NextResponse.json({ received: true })
}
