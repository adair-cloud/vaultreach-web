import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect("/login")
  }

  // Bypass NextAuth Edge Middleware staleness and verify subscription directly against the DB
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { stripeSubscriptionId: true }
  })

  const isDev = process.env.NODE_ENV === "development"

  if (!user?.stripeSubscriptionId && !isDev) {
    redirect("/subscribe")
  }

  return <>{children}</>
}
