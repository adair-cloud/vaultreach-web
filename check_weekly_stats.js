const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  console.log("=== VaultReach Weekly Report ===");
  
  const campaigns = await prisma.campaign.findMany({
    include: {
      user: true
    }
  });

  for (const c of campaigns) {
    console.log(`\nCampaign: ${c.name} (User: ${c.user.email})`);
    console.log(`Status: ${c.status}`);
    console.log(`Draft Mode: ${c.draftMode}`);
    console.log(`Last Ping: ${c.lastPing}`);

    const draftsSent = await prisma.draft.count({
      where: {
        campaignId: c.id,
        status: 'sent',
        sentAt: { gte: oneWeekAgo }
      }
    });
    
    const draftsCreated = await prisma.draft.count({
      where: {
        campaignId: c.id,
        createdAt: { gte: oneWeekAgo }
      }
    });

    const repliesReceived = await prisma.reply.count({
      where: {
        campaignId: c.id,
        receivedAt: { gte: oneWeekAgo }
      }
    });

    const analytics = await prisma.analytics.findMany({
      where: {
        campaignId: c.id,
        date: { gte: oneWeekAgo }
      },
      orderBy: { date: 'asc' }
    });

    console.log(`  Drafts Created (7d): ${draftsCreated}`);
    console.log(`  Drafts Sent (7d): ${draftsSent}`);
    console.log(`  Replies Received (7d): ${repliesReceived}`);
    console.log(`  Analytics Logs (7d):`);
    analytics.forEach(a => {
      console.log(`    ${a.date.toISOString().split('T')[0]} - Sent: ${a.emailsSent}, Replies: ${a.replies}, Approved: ${a.draftsApproved}, Rejected: ${a.draftsRejected}, Bounced: ${a.emailsBounced}`);
    });
    
    if (c.lastRunSummary) {
      console.log(`  Last Worker Run:`, JSON.stringify(c.lastRunSummary));
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
