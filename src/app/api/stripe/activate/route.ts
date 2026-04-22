import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/authOptions"

// Called by the /success page to verify payment and activate subscription
// independently of webhook delivery timing
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // If already activated, nothing to do
  if (user.stripeSubscriptionId) {
    return NextResponse.json({ activated: true, subscriptionId: user.stripeSubscriptionId })
  }

  // No Stripe customer yet — can't look up subscriptions
  if (!user.stripeCustomerId) {
    return NextResponse.json({ activated: false, reason: "no_customer" })
  }

  // Query Stripe directly for active or trialing subscriptions on this customer
  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: "all",
    limit: 5,
  })

  const validSub = subscriptions.data.find(sub => sub.status === "active" || sub.status === "trialing")

  if (!validSub) {
    return NextResponse.json({ activated: false, reason: "no_active_subscription" })
  }

  // Write it directly to the database — bypasses webhook timing entirely
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeSubscriptionId: validSub.id }
  })

  return NextResponse.json({ activated: true, subscriptionId: validSub.id })
}
