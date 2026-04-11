import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/authOptions"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { campaigns: { include: { analytics: true } } }
  })

  if (!user) return NextResponse.json({ campaign: null })

  const campaign = user.campaigns[0] ?? null
  return NextResponse.json({ campaign })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { websiteUrl, targetIndustry, targetTitles, employeeRange, targetLocations, tone, rules } = body

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // Upsert: update if exists, create if not
  const existing = await prisma.campaign.findFirst({ where: { userId: user.id } })

  let campaign
  if (existing) {
    campaign = await prisma.campaign.update({
      where: { id: existing.id },
      data: { websiteUrl, targetIndustry, targetTitles, employeeRange, targetLocations }
    })
  } else {
    campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        websiteUrl: websiteUrl ?? "",
        targetIndustry: targetIndustry ?? tone ?? "",
        targetTitles: targetTitles ?? rules ?? "",
        employeeRange: employeeRange ?? "1-50",
        targetLocations: targetLocations ?? "",
        status: "active"
      }
    })
  }

  return NextResponse.json({ campaign })
}
