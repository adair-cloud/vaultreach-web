const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("Analyzing database...")
  const users = await prisma.user.findMany({
    include: { accounts: true }
  })

  for (const user of users) {
    if (user.accounts.length > 1) {
      console.log(`\nFound User (${user.email}) with MULTIPLE linked Google accounts!`)
      console.log(`User ID: ${user.id}`)
      for (const acc of user.accounts) {
        console.log(` - Linked Account ID: ${acc.providerAccountId}`)
      }
      
      console.log(`\nAttempting to unlink extra accounts...`)
      // Keep only the first account, delete the rest to fix the hijack
      const accountsToDelete = user.accounts.slice(1)
      for (const acc of accountsToDelete) {
        await prisma.account.delete({ where: { id: acc.id } })
        console.log(`Deleted hijacked account link: ${acc.providerAccountId}`)
      }
    }
  }
  console.log("\nCleanup complete! You can now test your alternative emails cleanly.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
