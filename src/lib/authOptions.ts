import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
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
      if (user) token.id = user.id
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
