import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function setupVaultReach() {
  console.log("🚀 Starting VaultReach automated setup...")

  // Find the primary user
  const user = await prisma.user.findFirst()
  if (!user) {
    console.error("❌ No user found in the database. Please log in first.")
    process.exit(1)
  }

  // 1. Set Google App Password
  const appPassword = "ecob crtw txef kllk".replace(/\s+/g, "")
  await prisma.user.update({
    where: { id: user.id },
    data: { appPassword }
  })
  console.log("✅ Saved Google App Password")

  // 2. Setup Campaign ICP & AI Brain & Schedule
  let campaign = await prisma.campaign.findFirst({ where: { userId: user.id } })

  const campaignData = {
    // Lead Targeting
    targetIndustry: "B2B SaaS, Marketing Agencies, Recruiting Firms, IT Services",
    targetTitles: "Founder, CEO, VP of Sales, Head of Growth, Managing Director",
    employeeRange: "1-50",
    targetLocations: "United States, United Kingdom, Canada",
    websiteUrl: "https://www.vaultreach.ai",
    
    // AI Brain
    tone: "professional, direct, and slightly punchy",
    rules: "Keep the email under 100 words. Never use the word 'synergy', 'innovative', or 'revolutionary'. Focus entirely on the fact that VaultReach is an AI Sales Rep that runs 24/7 while you sleep, handling scraping, writing, and booking meetings automatically. Ask for a quick 10-minute demo to see it in action.",
    
    // Schedule (EST)
    timezone: "America/New_York",
    sendWindowStart: 9,   // 9 AM
    sendWindowEnd: 17,    // 5 PM
    sendDays: "1,2,3,4,5", // Mon-Fri
    draftMode: true,       // Keep draft mode ON for the first few emails
    status: "active"       // Unlock prospecting!
  }

  if (campaign) {
    campaign = await prisma.campaign.update({
      where: { id: campaign.id },
      data: campaignData
    })
    console.log("✅ Updated existing campaign configuration")
  } else {
    campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        ...campaignData
      }
    })
    console.log("✅ Created new campaign configuration")
  }

  console.log("🎉 VaultReach is fully set up and ready to prospect itself!")
}

setupVaultReach()
  .catch(e => {
    console.error("❌ Setup failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
