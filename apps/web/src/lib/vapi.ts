const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_BASE_URL = "https://api.vapi.ai";

export async function startOutboundCall({
  phoneNumber,
  assistantId,
  customerDetails,
}: {
  phoneNumber: string;
  assistantId?: string;
  customerDetails?: Record<string, unknown>;
}) {
  if (!VAPI_API_KEY) {
    throw new Error("VAPI_API_KEY is not configured");
  }

  const response = await fetch(`${VAPI_BASE_URL}/call`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistantId: assistantId || process.env.VAPI_ASSISTANT_ID,
      customer: {
        number: phoneNumber,
        ...customerDetails,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vapi call failed: ${error}`);
  }

  return response.json();
}
