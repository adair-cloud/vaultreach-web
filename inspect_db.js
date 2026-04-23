const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== USERS ===");
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['adair.clark@gmail.com', 'adair@vaultreach.ai', 'bravelittlegeorge@gmail.com']
      }
    },
    include: {
      accounts: true,
      sessions: true
    }
  });
  
  users.forEach(u => {
    console.log(`\nUser: ${u.email} (ID: ${u.id})`);
    console.log(`  Accounts:`);
    u.accounts.forEach(a => console.log(`    - Provider: ${a.provider}, ProviderAccountId: ${a.providerAccountId}`));
  });
  
  // Look for any accounts that might be pointing to the wrong user
  console.log("\n=== CHECKING IF ANY OTHER ACCOUNTS EXIST ===");
  const allAccounts = await prisma.account.findMany();
  allAccounts.forEach(a => {
      console.log(`Account ID: ${a.providerAccountId} -> User ID: ${a.userId}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
