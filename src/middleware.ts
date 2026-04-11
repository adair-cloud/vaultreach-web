import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // If accessing dashboard and not subscribed → redirect to subscribe
    if (pathname.startsWith("/dashboard")) {
      // Allow access if user has an active Stripe subscription OR in dev mode
      const isSubscribed = !!token?.stripeSubscriptionId
      const isDev = process.env.NODE_ENV === "development"

      if (!isSubscribed && !isDev) {
        return NextResponse.redirect(new URL("/subscribe", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // withAuth runs middleware only when this returns true
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"],
}
