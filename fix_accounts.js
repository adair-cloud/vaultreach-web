const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log("Starting fix...");
  const user = await prisma.user.findUnique({ where: { email: 'adair.clark@gmail.com' }, include: { accounts: true }});
  
  if (!user) {
      console.log("User adair.clark@gmail.com not found");
  } else {
      console.log("Found user:", user.email, "with", user.accounts.length, "accounts");
      await prisma.account.deleteMany({
        where: { userId: user.id }
      });
      console.log("✅ Wiped all OAuth links from adair.clark@gmail.com");
  }
  
  const user2 = await prisma.user.findUnique({ where: { email: 'adair@vaultreach.ai' }});
  if (user2) {
      await prisma.user.delete({ where: { id: user2.id } });
      console.log("✅ Deleted lingering adair@vaultreach.ai user record");
  } else {
      console.log("No lingering user found for adair@vaultreach.ai");
  }
}
fix().then(() => prisma.$disconnect()).catch(e => console.error(e));
