import { headers } from "next/headers";

/**
 * Minimal auth helper for the MVP.
 * In production, replace with NextAuth/Clerk and validate the user's organization.
 */
export async function getCurrentOrganizationId(): Promise<string> {
  const headersList = await headers();
  const orgId = headersList.get("x-organization-id") || process.env.DEFAULT_ORGANIZATION_ID;

  if (!orgId) {
    throw new Error("Organization ID is required");
  }

  return orgId;
}
