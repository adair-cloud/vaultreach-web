const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("USERS:");
  console.log(users.map(u => ({ id: u.id, name: u.name, email: u.email })));

  const accounts = await prisma.account.findMany();
  console.log("\nACCOUNTS:");
  console.log(accounts.map(a => ({ id: a.id, userId: a.userId, provider: a.provider, providerAccountId: a.providerAccountId })));
}
main().finally(() => prisma.$disconnect());
