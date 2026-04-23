/**
 * Surgical fix: remove ALL Google account links from adair's User record
 * except adair's own primary Google ID, then verify the state.
 * 
 * Run with: node nuclear_fix.js
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ADAIR_USER_ID = "cmnv47pp70000caxwkih4fwgd"
const ADAIR_GOOGLE_ID = "117814254271479910989"  // adair's confirmed primary Google ID

async function main() {
  console.log("=== PRE-FIX STATE ===")
  
  // Show ALL users and their accounts
  const allUsers = await prisma.user.findMany({ include: { accounts: true } })
  for (const u of allUsers) {
    console.log(`\nUser: ${u.email} | ID: ${u.id}`)
    for (const a of u.accounts) {
      console.log(`  Google ID: ${a.providerAccountId} | Account record ID: ${a.id}`)
    }
  }

  // Delete every Account linked to adair's User EXCEPT adair's own Google ID
  const rogue = await prisma.account.findMany({
    where: {
      userId: ADAIR_USER_ID,
      NOT: { providerAccountId: ADAIR_GOOGLE_ID }
    }
  })

  if (rogue.length === 0) {
    console.log("\n✅ No rogue account links found on adair's user.")
  } else {
    console.log(`\n🔴 Found ${rogue.length} rogue account(s) still linked to adair's user. Deleting...`)
    for (const a of rogue) {
      await prisma.account.delete({ where: { id: a.id } })
      console.log(`  Deleted: Google ID ${a.providerAccountId}`)
    }
  }

  // Also delete any orphan User records for test emails (not adair's account)
  const orphans = await prisma.user.findMany({
    where: { NOT: { email: "adair.clark@gmail.com" } }
  })
  if (orphans.length > 0) {
    console.log(`\n🔴 Found ${orphans.length} orphan user record(s). Deleting...`)
    for (const u of orphans) {
      // Delete their accounts first, then the user
      await prisma.account.deleteMany({ where: { userId: u.id } })
      await prisma.user.delete({ where: { id: u.id } })
      console.log(`  Deleted orphan user: ${u.email}`)
    }
  }

  console.log("\n=== POST-FIX STATE ===")
  const finalUsers = await prisma.user.findMany({ include: { accounts: true } })
  for (const u of finalUsers) {
    console.log(`\nUser: ${u.email} | ID: ${u.id}`)
    for (const a of u.accounts) {
      console.log(`  Google ID: ${a.providerAccountId}`)
    }
  }
  console.log("\n✅ Done. Now sign out of VaultReach on ALL windows, then sign in fresh as bravelittlegeorge in incognito.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
