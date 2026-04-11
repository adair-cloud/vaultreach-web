import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
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
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        // In Phase 3, we extract token.refreshToken and save it to the Prisma Database using the user's email
      }
      return token
    },
    async session({ session, token }) {
      // @ts-expect-error: NextAuth dynamically injects accessToken but types omit it
      session.accessToken = token.accessToken
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
})

export { handler as GET, handler as POST }
