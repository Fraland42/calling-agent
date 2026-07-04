import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const DEFAULT_MODEL = "gpt-4o-mini";

export async function generateAIResponse({
  prompt,
  system,
  model = DEFAULT_MODEL,
}: {
  prompt: string;
  system?: string;
  model?: string;
}) {
  const { text } = await generateText({
    model: openai(model),
    system:
      system ||
      "You are a helpful, friendly AI assistant for a real estate company. Keep responses concise and action-oriented.",
    prompt,
  });
  return text;
}
