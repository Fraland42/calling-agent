import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrganizationId } from "@/lib/auth";
import { getCampaigns, createCampaign } from "@/services/campaign.service";
import { z } from "zod";

const stepSchema = z.object({
  name: z.string(),
  channel: z.enum(["sms", "email", "call"]),
  delayMinutes: z.number().default(0),
  promptTemplate: z.string(),
  order: z.number(),
});

const createCampaignSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  trigger: z.enum(["new_lead", "status_change", "manual"]),
  steps: z.array(stepSchema).min(1),
});

export async function GET() {
  try {
    const organizationId = await getCurrentOrganizationId();
    const campaigns = await getCampaigns(organizationId);
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Get campaigns error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrganizationId();
    const body = await request.json();
    const data = createCampaignSchema.parse(body);

    const campaign = await createCampaign({
      organizationId,
      name: data.name,
      description: data.description,
      trigger: data.trigger,
      steps: data.steps,
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 400 });
  }
}
