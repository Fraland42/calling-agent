import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrganizationId } from "@/lib/auth";
import { findOrCreateLead } from "@/services/lead.service";
import { triggerCampaignForLead } from "@/services/campaign.service";
import { z } from "zod";

const facebookLeadSchema = z.object({
  id: z.string(),
  created_time: z.string().optional(),
  field_data: z.array(z.object({ name: z.string(), values: z.array(z.string()) })),
});

export async function POST(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrganizationId();
    const body = await request.json();

    const leadData = facebookLeadSchema.parse(
      body.entry?.[0]?.changes?.[0]?.value?.leadgen_id
        ? body.entry[0].changes[0].value
        : body
    );

    const fields: Record<string, string> = {};
    for (const field of leadData.field_data) {
      fields[field.name] = field.values[0];
    }

    const lead = await findOrCreateLead({
      organizationId,
      source: "facebook_ads",
      sourceId: leadData.id,
      firstName: fields.first_name || fields.firstName,
      lastName: fields.last_name || fields.lastName,
      email: fields.email,
      phone: fields.phone_number || fields.phone,
      language: fields.locale || "en",
      notes: `Facebook Lead ID: ${leadData.id}`,
    });

    await triggerCampaignForLead({ organizationId, leadId: lead.id, trigger: "new_lead" });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error("Facebook webhook error:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  // Meta webhook verification
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}
