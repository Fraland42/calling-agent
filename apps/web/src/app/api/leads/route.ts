import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrganizationId } from "@/lib/auth";
import { findOrCreateLead, getLeadsByOrganization } from "@/services/lead.service";
import { triggerCampaignForLead } from "@/services/campaign.service";
import { z } from "zod";

const createLeadSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.string().default("manual"),
  language: z.string().default("en"),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const organizationId = await getCurrentOrganizationId();
    const leads = await getLeadsByOrganization(organizationId);
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrganizationId();
    const body = await request.json();
    const data = createLeadSchema.parse(body);

    const lead = await findOrCreateLead({
      organizationId,
      source: data.source,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      language: data.language,
      notes: data.notes,
    });

    await triggerCampaignForLead({ organizationId, leadId: lead.id, trigger: "new_lead" });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Create lead error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 400 });
  }
}
