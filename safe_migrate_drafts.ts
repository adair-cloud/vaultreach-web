import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Applying Draft Mode database schema...")
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "draftMode" BOOLEAN NOT NULL DEFAULT true;
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Draft" (
        "id" TEXT NOT NULL,
        "campaignId" TEXT NOT NULL,
        "leadEmail" TEXT NOT NULL,
        "leadFirstName" TEXT,
        "leadCompany" TEXT,
        "emailBody" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
      );
    `)

    // We don't add the foreign key manually to keep it simple and avoid "already exists" errors,
    // Prisma will enforce relations on the app layer and future proper migrations can solidify it.
    
    console.log("✅ Draft Mode migration applied successfully!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
