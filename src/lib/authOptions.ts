import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.send",
          access_type: "offline",
          prompt: "consent",
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Capture id and access token on first sign-in
      if (user) {
        token.id = user.id
        
        // Forced Stripe Sync: Mitigates Vercel/Neon branching data loss 
        // by recovering their active subscription and campaign shell from Stripe directly.
        if (!user.stripeSubscriptionId && user.email) {
          try {
            const customers = await stripe.customers.list({ email: user.email, limit: 1 })
            if (customers.data.length > 0) {
              const customerId = customers.data[0].id
              const subscriptions = await stripe.subscriptions.list({
                customer: customerId,
                status: "all",
                limit: 1,
              })
              
              const validSub = subscriptions.data.find(sub => sub.status === "active" || sub.status === "trialing")
              
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  stripeCustomerId: customerId,
                  stripeSubscriptionId: validSub?.id || null
                }
              })
              
              if (validSub) {
                // Auto-recover campaign shell so they aren't stuck without configuration
                const existingCampaigns = await prisma.campaign.count({ where: { userId: user.id } })
                if (existingCampaigns === 0) {
                  await prisma.campaign.create({
                    data: {
                      userId: user.id,
                      status: "inactive",
                      targetIndustry: "",
                      targetTitles: "founder,ceo,owner",
                      employeeRange: "1,200",
                      targetLocations: "United States",
                      websiteUrl: "",
                      tone: "professional",
                    }
                  })
                }
              }
            }
          } catch (error) {
            console.error("Failed to force-sync Stripe subscription during login:", error)
          }
        }
      }
      
      if (account) token.accessToken = account.access_token

      // ALWAYS re-read stripeSubscriptionId from the database.
      // This ensures that when the client calls useSession().update() after a
      // successful Stripe payment, the new subscription is picked up immediately.
      const userId = (token.id ?? user?.id) as string | undefined
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { stripeSubscriptionId: true }
        })
        token.stripeSubscriptionId = dbUser?.stripeSubscriptionId ?? null
      }

      return token
    },
    async session({ session, token }) {
      // @ts-expect-error: NextAuth dynamically injects user id but types omit it
      session.user.id = token.id
      // @ts-expect-error: NextAuth dynamically injects accessToken but types omit it
      session.accessToken = token.accessToken
      // @ts-expect-error: Expose subscription to client so update() detects changes
      session.stripeSubscriptionId = token.stripeSubscriptionId
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
}
