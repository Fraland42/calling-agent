import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrganizationId } from "@/lib/auth";
import { startAiCall } from "@/services/voice.service";
import { z } from "zod";

const callSchema = z.object({
  phone: z.string().min(5),
  assistantId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrganizationId();
    const body = await request.json();
    const data = callSchema.parse(body);

    const result = await startAiCall({
      organizationId,
      phone: data.phone,
      assistantId: data.assistantId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Start call error:", error);
    return NextResponse.json({ error: "Failed to start call" }, { status: 500 });
  }
}
