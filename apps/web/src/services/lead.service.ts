import { prisma } from "@/lib/prisma";

export async function findOrCreateLead({
  organizationId,
  source,
  sourceId,
  firstName,
  lastName,
  email,
  phone,
  language,
  notes,
}: {
  organizationId: string;
  source: string;
  sourceId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  language?: string;
  notes?: string;
}) {
  const existing = sourceId
    ? await prisma.lead.findFirst({
        where: { organizationId, sourceId },
      })
    : null;

  if (existing) {
    return prisma.lead.update({
      where: { id: existing.id },
      data: {
        firstName: firstName ?? existing.firstName,
        lastName: lastName ?? existing.lastName,
        email: email ?? existing.email,
        phone: phone ?? existing.phone,
        language: language ?? existing.language,
        notes: notes ?? existing.notes,
      },
    });
  }

  return prisma.lead.create({
    data: {
      organizationId,
      source,
      sourceId,
      firstName,
      lastName,
      email,
      phone,
      language: language || "en",
      notes,
    },
  });
}

export async function getLeadsByOrganization(organizationId: string) {
  return prisma.lead.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      conversations: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}
