import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Campaign" 
      ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
      ADD COLUMN IF NOT EXISTS "sendWindowStart" INTEGER NOT NULL DEFAULT 9,
      ADD COLUMN IF NOT EXISTS "sendWindowEnd" INTEGER NOT NULL DEFAULT 17,
      ADD COLUMN IF NOT EXISTS "sendDays" TEXT NOT NULL DEFAULT '1,2,3,4,5';
    `)
    return NextResponse.json({ success: true, message: "Columns safely added!" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
