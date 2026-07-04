import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrganizationId } from "@/lib/auth";
import { sendOutboundSms } from "@/services/sms.service";
import { z } from "zod";

const sendSmsSchema = z.object({
  phone: z.string().min(5),
  body: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrganizationId();
    const body = await request.json();
    const data = sendSmsSchema.parse(body);

    const result = await sendOutboundSms({
      organizationId,
      phone: data.phone,
      body: data.body,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Send SMS error:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
