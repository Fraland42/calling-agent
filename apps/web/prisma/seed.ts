import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      name: "Default Organization",
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    create: {
      email: "admin@example.com",
      name: "Admin User",
      organizationId: org.id,
    },
    update: {},
  });

  await prisma.campaign.upsert({
    where: { id: "default-nurture" },
    create: {
      id: "default-nurture",
      organizationId: org.id,
      name: "New Lead Nurture",
      description: "Default SMS nurture sequence for new leads.",
      trigger: "new_lead",
      status: "active",
      steps: {
        create: [
          {
            name: "Immediate Welcome",
            channel: "sms",
            delayMinutes: 0,
            promptTemplate:
              "Thanks for reaching out! I'm your AI real estate assistant. Are you looking to buy, sell, or rent?",
            order: 0,
          },
          {
            name: "Follow-up",
            channel: "sms",
            delayMinutes: 1440,
            promptTemplate:
              "Just following up. Do you have any questions about the market or a specific property?",
            order: 1,
          },
        ],
      },
    },
    update: {},
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
