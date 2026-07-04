import { twilioClient, isTwilioConfigured } from "@/lib/twilio";
import { findOrCreateLead } from "@/services/lead.service";
import { getOrCreateConversation, addMessage } from "@/services/conversation.service";
import { buildAndGenerateResponse } from "@/services/ai.service";

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export async function handleIncomingSms({
  organizationId,
  from,
  to,
  body,
}: {
  organizationId: string;
  from: string;
  to: string;
  body: string;
}) {
  const lead = await findOrCreateLead({
    organizationId,
    source: "sms",
    phone: from,
  });

  const conversation = await getOrCreateConversation({
    organizationId,
    leadId: lead.id,
    channel: "sms",
  });

  await addMessage({
    conversationId: conversation.id,
    role: "user",
    content: body,
    metadata: { from, to },
  });

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

  await addMessage({
    conversationId: conversation.id,
    role: "assistant",
    content: reply,
    metadata: { from: to, to: from },
  });

  await sendSms({ to: from, body: reply });

  return { leadId: lead.id, conversationId: conversation.id, reply };
}

export async function sendSms({ to, body }: { to: string; body: string }) {
  if (!isTwilioConfigured() || !FROM_NUMBER) {
    console.warn("Twilio is not configured. SMS not sent.", { to, body });
    return null;
  }

  return twilioClient!.messages.create({
    from: FROM_NUMBER,
    to,
    body,
  });
}

export async function sendOutboundSms({
  organizationId,
  phone,
  body,
}: {
  organizationId: string;
  phone: string;
  body: string;
}) {
  const lead = await findOrCreateLead({ organizationId, source: "manual", phone });
  const conversation = await getOrCreateConversation({ organizationId, leadId: lead.id, channel: "sms" });

  await addMessage({ conversationId: conversation.id, role: "assistant", content: body });
  await sendSms({ to: phone, body });

  return { leadId: lead.id, conversationId: conversation.id };
}
