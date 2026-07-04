import { prisma } from "@/lib/prisma";
import { sendSms } from "@/services/sms.service";

export async function getCampaigns(organizationId: string) {
  return prisma.campaign.findMany({
    where: { organizationId },
    include: { steps: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCampaign({
  organizationId,
  name,
  description,
  trigger,
  steps,
}: {
  organizationId: string;
  name: string;
  description?: string;
  trigger: string;
  steps: { name: string; channel: string; delayMinutes: number; promptTemplate: string; order: number }[];
}) {
  return prisma.campaign.create({
    data: {
      organizationId,
      name,
      description,
      trigger,
      steps: {
        create: steps,
      },
    },
    include: { steps: true },
  });
}

export async function enrollLeadInCampaign({
  campaignId,
  leadId,
}: {
  campaignId: string;
  leadId: string;
}) {
  return prisma.campaignEnrollment.upsert({
    where: { campaignId_leadId: { campaignId, leadId } },
    create: { campaignId, leadId, currentStep: 0, status: "active" },
    update: { currentStep: 0, status: "active" },
  });
}

export async function runCampaignStep(enrollmentId: string) {
  const enrollment = await prisma.campaignEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      campaign: { include: { steps: { orderBy: { order: "asc" } } } },
      lead: true,
    },
  });

  if (!enrollment || enrollment.status !== "active") return null;

  const step = enrollment.campaign.steps[enrollment.currentStep];
  if (!step) {
    await prisma.campaignEnrollment.update({
      where: { id: enrollment.id },
      data: { status: "completed" },
    });
    return null;
  }

  const { lead } = enrollment;

  if (step.channel === "sms" && lead.phone) {
    const conversation = await prisma.conversation.create({
      data: {
        organizationId: lead.organizationId,
        leadId: lead.id,
        channel: "sms",
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: step.promptTemplate,
      },
    });

    await sendSms({ to: lead.phone, body: step.promptTemplate });
  }

  if (step.channel === "call" && lead.phone) {
    // Outbound calls are scheduled and handled by a separate voice worker.
    console.log("Scheduled voice call for step", step.id, "lead", lead.id);
  }

  await prisma.campaignEnrollment.update({
    where: { id: enrollment.id },
    data: { currentStep: enrollment.currentStep + 1 },
  });

  return enrollment;
}

export async function triggerCampaignForLead({
  organizationId,
  leadId,
  trigger,
}: {
  organizationId: string;
  leadId: string;
  trigger: string;
}) {
  const campaigns = await prisma.campaign.findMany({
    where: { organizationId, trigger, status: "active" },
  });

  for (const campaign of campaigns) {
    await enrollLeadInCampaign({ campaignId: campaign.id, leadId });
  }

  return campaigns.length;
}
