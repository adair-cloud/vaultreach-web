import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/authOptions"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // Reuse existing Stripe customer or create one
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: session.user.name ?? undefined,
    })
    customerId = customer.id
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId }
    })
  }

  let hasUsedTrial = false

  // Pre-Checkout Stripe Audit
  if (customerId) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 5,
    })

    const activeSub = subscriptions.data.find(sub => sub.status === "active" || sub.status === "trialing")
    
    // Scenario 1: They already have an active subscription!
    // They don't need to check out. Redirect to /success so the app can repair its DB sync.
    if (activeSub) {
      return NextResponse.json({ url: `${process.env.NEXTAUTH_URL}/success` })
    }

    // Scenario 2: They have past subscriptions (canceled, past_due, unpaid, etc.)
    // We strip the trial so they are charged immediately.
    if (subscriptions.data.length > 0) {
      hasUsedTrial = true
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    mode: "subscription",
    ...(hasUsedTrial ? {} : { subscription_data: { trial_period_days: 7 } }),
    success_url: `${process.env.NEXTAUTH_URL}/success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/subscribe?canceled=true`,
    metadata: { userId: user.id },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
