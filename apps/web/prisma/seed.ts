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

  const sampleLead = await prisma.lead.upsert({
    where: { id: "sample-lead-1" },
    create: {
      id: "sample-lead-1",
      organizationId: org.id,
      source: "facebook_ads",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "+15551234567",
      language: "en",
      status: "new",
      notes: "Interested in buying a home in Austin, TX",
    },
    update: {},
  });

  const chatConversation = await prisma.conversation.upsert({
    where: { id: "sample-conversation-1" },
    create: {
      id: "sample-conversation-1",
      organizationId: org.id,
      leadId: sampleLead.id,
      channel: "chat",
      status: "active",
    },
    update: {},
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: chatConversation.id,
        role: "user",
        content: "Hi, I'm looking for a 3-bedroom home in Austin.",
      },
      {
        conversationId: chatConversation.id,
        role: "assistant",
        content: "Great! What's your budget and preferred move-in timeline?",
      },
    ],
    skipDuplicates: false,
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
