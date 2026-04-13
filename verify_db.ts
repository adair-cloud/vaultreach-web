import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  console.log("🔍 Checking VaultReach Database for Worker Activity...\n")

  // Check 1: Campaign lastPing
  const campaigns = await prisma.campaign.findMany({
    select: {
      id: true,
      lastPing: true,
      user: { select: { email: true } }
    }
  })

  console.log("--- 📡 Campaign Pings ---")
  if (campaigns.length === 0) {
    console.log("No campaigns found.")
  } else {
    campaigns.forEach(c => {
      let status = "🔴 Never Pinged"
      if (c.lastPing) {
        const ageHrs = (Date.now() - new Date(c.lastPing).getTime()) / (1000 * 60 * 60)
        if (ageHrs < 2) status = "🟢 ACTIVE (< 2 hrs ago)"
        else if (ageHrs < 24) status = "🟡 IDLE (2-24 hrs ago)"
        else status = `🔴 OFFLINE (${ageHrs.toFixed(1)} hrs ago)`
      }
      console.log(`User: ${c.user.email} | Status: ${status} | lastPing: ${c.lastPing}`)
    })
  }

  console.log("\n--- 📈 Analytics Data ---")
  const recentAnalytics = await prisma.analytics.findMany({
    orderBy: { date: 'desc' },
    take: 5
  })
  
  if (recentAnalytics.length === 0) {
    console.log("No analytics rows found yet.")
  } else {
    console.table(recentAnalytics.map(a => ({
      campaignId: a.campaignId.substring(0, 8) + '...',
      date: a.date,
      emailsSent: a.emailsSent,
      replies: a.replies,
      meetings: a.meetings
    })))
  }

  await prisma.$disconnect()
}

verify().catch(console.error)
