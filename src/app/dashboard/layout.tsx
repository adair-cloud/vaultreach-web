import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/prisma"

// Emails that always have free, unrestricted access (internal / owner accounts)
const OWNER_EMAILS = ["adair@vaultreach.ai"]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect("/login")
  }

  const email = session.user.email

  // Owner accounts bypass all subscription checks
  if (OWNER_EMAILS.includes(email)) {
    return <>{children}</>
  }

  // Bypass NextAuth Edge Middleware staleness and verify subscription directly against the DB
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      stripeSubscriptionId: true,
      campaigns: { where: { status: "active" }, select: { id: true }, take: 1 }
    }
  })

  const isDev = process.env.NODE_ENV === "development"
  const hasActiveCampaign = (user?.campaigns?.length ?? 0) > 0

  // Grant access if: dev mode, Stripe subscription, or manually-activated campaign
  if (!user?.stripeSubscriptionId && !hasActiveCampaign && !isDev) {
    redirect("/subscribe")
  }

  return <>{children}</>
}

