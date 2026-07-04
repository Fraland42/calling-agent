import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runCampaignStep } from "@/services/campaign.service";

export async function GET() {
  // This endpoint is intended to be triggered by a cron job (e.g., Vercel Cron).
  const enrollments = await prisma.campaignEnrollment.findMany({
    where: { status: "active" },
    include: { campaign: { include: { steps: { orderBy: { order: "asc" } } } } },
  });

  const results = [];
  for (const enrollment of enrollments) {
    const step = enrollment.campaign.steps[enrollment.currentStep];
    if (!step) continue;

    // Simple cron scheduler: run if enough time has passed since enrollment creation/update.
    const lastRun = enrollment.updatedAt;
    const minutesSinceLastRun = (Date.now() - lastRun.getTime()) / 60000;

    if (minutesSinceLastRun >= step.delayMinutes) {
      const result = await runCampaignStep(enrollment.id);
      results.push({ enrollmentId: enrollment.id, executed: !!result });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
