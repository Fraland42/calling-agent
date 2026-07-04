import { prisma } from "@/lib/prisma";

export async function getOrCreateConversation({
  organizationId,
  leadId,
  channel,
}: {
  organizationId: string;
  leadId: string;
  channel: string;
}) {
  const existing = await prisma.conversation.findFirst({
    where: { organizationId, leadId, channel, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      organizationId,
      leadId,
      channel,
    },
  });
}

export async function addMessage({
  conversationId,
  role,
  content,
  metadata,
}: {
  conversationId: string;
  role: string;
  content: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.message.create({
    data: {
      conversationId,
      role,
      content,
      metadata: (metadata || {}) as never,
    },
  });
}

export async function getConversationMessages(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}
