import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

// TEMP DEBUG ENDPOINT — remove after investigation
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  return NextResponse.json({
    token_id: token?.id ?? null,
    token_email: token?.email ?? null,
    token_name: token?.name ?? null,
    token_sub: token?.sub ?? null,
    stripe_sub_id: token?.stripeSubscriptionId ?? null,
  })
}
