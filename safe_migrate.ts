import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Applying safe migration to the database...")
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Campaign" 
      ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
      ADD COLUMN IF NOT EXISTS "sendWindowStart" INTEGER NOT NULL DEFAULT 9,
      ADD COLUMN IF NOT EXISTS "sendWindowEnd" INTEGER NOT NULL DEFAULT 17,
      ADD COLUMN IF NOT EXISTS "sendDays" TEXT NOT NULL DEFAULT '1,2,3,4,5';
    `)
    console.log("✅ Migration applied successfully! AcreLogic tables were untouched.")
  } catch (error) {
    console.error("❌ Migration failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
