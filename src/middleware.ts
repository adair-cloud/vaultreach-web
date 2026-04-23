import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Dashboard subscription check is now securely handled by Server Components (layout.tsx)
    // to bypass NextAuth JWT staleness edge cases.

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
