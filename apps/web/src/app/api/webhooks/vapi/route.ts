import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (message?.type === "call-ended") {
      const call = message.call;
      const leadPhone = call.customer?.number;
      const organizationId = call.assistantOverrides?.organizationId || "default";

      let lead = leadPhone
        ? await prisma.lead.findFirst({ where: { organizationId, phone: leadPhone } })
        : null;

      if (!lead && leadPhone) {
        lead = await prisma.lead.create({
          data: {
            organizationId,
            source: "vapi_call",
            phone: leadPhone,
          },
        });
      }

      if (lead) {
        const conversation = await prisma.conversation.create({
          data: {
            organizationId,
            leadId: lead.id,
            channel: "call",
          },
        });

        await prisma.callLog.create({
          data: {
            conversationId: conversation.id,
            providerCallId: call.id,
            direction: "outbound",
            status: call.status,
            durationSeconds: call.durationSeconds,
            recordingUrl: call.recordingUrl,
            transcript: call.transcript,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return NextResponse.json({ error: "Failed to process call" }, { status: 500 });
  }
}
