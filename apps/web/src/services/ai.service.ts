import { generateAIResponse } from "@/lib/ai";
import { getConversationMessages } from "@/services/conversation.service";

const REAL_ESTATE_SYSTEM_PROMPT = `You are an AI assistant for a real estate team. Your goals:
- Greet leads warmly and qualify their intent (buying, selling, renting, investing).
- Ask concise questions to understand their timeline, budget, and preferred location.
- Suggest booking an appointment with a human agent when appropriate.
- Respond in the same language the lead is using.
- Keep replies short, friendly, and professional (1-3 sentences max).`;

export async function buildAndGenerateResponse({
  conversationId,
  leadContext,
}: {
  conversationId: string;
  leadContext: {
    firstName?: string | null;
    lastName?: string | null;
    source?: string;
    language?: string;
    notes?: string | null;
  };
}) {
  const messages = await getConversationMessages(conversationId);
  const history = messages
    .map((m) => `${m.role === "user" ? "Lead" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `Lead context: ${JSON.stringify(leadContext)}\n\nConversation history:\n${history}\n\nRespond as the assistant.`;

  return generateAIResponse({
    system: REAL_ESTATE_SYSTEM_PROMPT,
    prompt,
  });
}
