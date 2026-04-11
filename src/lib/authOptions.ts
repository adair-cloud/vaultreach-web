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
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly",
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
      if (account && user) {
        token.id = user.id
        token.accessToken = account.access_token
        // Attach subscription status to JWT so middleware can gate /dashboard
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
        token.stripeSubscriptionId = dbUser?.stripeSubscriptionId ?? null
      }
      return token
    },
    async session({ session, token }) {
      // @ts-expect-error: NextAuth dynamically injects user id but types omit it
      session.user.id = token.id
      // @ts-expect-error: NextAuth dynamically injects accessToken but types omit it
      session.accessToken = token.accessToken
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
}
