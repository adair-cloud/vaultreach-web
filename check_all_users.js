const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== ALL USERS IN DB ===");
  const users = await prisma.user.findMany({
    include: { campaigns: true }
  });

  if (users.length === 0) {
    console.log("No users found.");
  }

  for (const u of users) {
    console.log(`\nUser: ${u.email}`);
    console.log(`  hasOnboarded: ${u.hasOnboarded}`);
    console.log(`  stripeSubscriptionId: ${u.stripeSubscriptionId ?? 'none'}`);
    console.log(`  apolloApiKey set: ${!!u.apolloApiKey}`);
    console.log(`  Campaigns: ${u.campaigns.length}`);
    for (const c of u.campaigns) {
      console.log(`    - Campaign: "${c.name}" | status: ${c.status} | draftMode: ${c.draftMode} | lastPing: ${c.lastPing}`);
      console.log(`      targetIndustry: ${c.targetIndustry}`);
      console.log(`      targetTitles: ${c.targetTitles}`);
      console.log(`      lastRunSummary: ${c.lastRunSummary ? JSON.stringify(c.lastRunSummary) : 'none'}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
