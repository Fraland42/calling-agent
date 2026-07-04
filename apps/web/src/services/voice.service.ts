import { startOutboundCall } from "@/lib/vapi";
import { findOrCreateLead } from "@/services/lead.service";
import { prisma } from "@/lib/prisma";

export async function startAiCall({
  organizationId,
  phone,
  assistantId,
}: {
  organizationId: string;
  phone: string;
  assistantId?: string;
}) {
  const lead = await findOrCreateLead({
    organizationId,
    source: "voice",
    phone,
  });

  const conversation = await prisma.conversation.create({
    data: {
      organizationId,
      leadId: lead.id,
      channel: "call",
    },
  });

  const call = await startOutboundCall({
    phoneNumber: phone,
    assistantId,
    customerDetails: {
      leadId: lead.id,
      organizationId,
      language: lead.language,
    },
  });

  await prisma.callLog.create({
    data: {
      conversationId: conversation.id,
      providerCallId: call.id,
      direction: "outbound",
      status: "initiated",
    },
  });

  return { leadId: lead.id, conversationId: conversation.id, call };
}
