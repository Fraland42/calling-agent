import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizationId } from "@/lib/auth";
import { findOrCreateLead } from "@/services/lead.service";
import { getOrCreateConversation, addMessage } from "@/services/conversation.service";
import { buildAndGenerateResponse } from "@/services/ai.service";
import { triggerCampaignForLead } from "@/services/campaign.service";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1),
  leadId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  language: z.string().default("en"),
});

export async function POST(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrganizationId();
    const body = await request.json();
    const data = chatSchema.parse(body);

    let lead;
    if (data.leadId) {
      lead = await prisma.lead.findUnique({ where: { id: data.leadId } });
    }

    if (!lead) {
      const [firstName, ...rest] = (data.name || "Website Visitor").split(" ");
      lead = await findOrCreateLead({
        organizationId,
        source: "website_chat",
        firstName,
        lastName: rest.join(" ") || undefined,
        email: data.email,
        phone: data.phone,
        language: data.language,
      });

      await triggerCampaignForLead({ organizationId, leadId: lead.id, trigger: "new_lead" });
    }

    const conversation = await getOrCreateConversation({
      organizationId,
      leadId: lead.id,
      channel: "chat",
    });

    await addMessage({ conversationId: conversation.id, role: "user", content: data.message });

    const reply = await buildAndGenerateResponse({
      conversationId: conversation.id,
      leadContext: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        source: lead.source,
        language: lead.language,
        notes: lead.notes,
      },
    });

    await addMessage({ conversationId: conversation.id, role: "assistant", content: reply });

    return NextResponse.json({
      reply,
      leadId: lead.id,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
