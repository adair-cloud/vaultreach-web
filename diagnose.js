const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({ include: { accounts: true } })
  console.log("\n=== ALL USERS IN DATABASE ===")
  for (const u of users) {
    console.log(`\nUser: ${u.email} | ID: ${u.id}`)
    console.log(`  Accounts linked:`)
    for (const a of u.accounts) {
      console.log(`    - Google ID: ${a.providerAccountId}`)
    }
  }
  console.log("\n=== TOTAL USERS:", users.length, "===")
}
main().catch(console.error).finally(() => prisma.$disconnect())
