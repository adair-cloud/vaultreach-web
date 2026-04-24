import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, stripeSubscriptionId: true, stripeCustomerId: true, accounts: true, campaigns: true }
  })
  console.dir(users, { depth: null })
}
main()
