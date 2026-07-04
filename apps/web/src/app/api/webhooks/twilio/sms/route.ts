import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrganizationId } from "@/lib/auth";
import { handleIncomingSms } from "@/services/sms.service";

export async function POST(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrganizationId();
    const formData = await request.formData();

    const from = formData.get("From") as string;
    const to = formData.get("To") as string;
    const body = formData.get("Body") as string;

    if (!from || !body) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const result = await handleIncomingSms({ organizationId, from, to, body });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Twilio SMS webhook error:", error);
    return NextResponse.json({ error: "Failed to process SMS" }, { status: 500 });
  }
}
