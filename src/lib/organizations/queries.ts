import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";

// Temporary stand-in for auth-derived organization context. Once
// authentication exists, callers should get the organization from the
// signed-in user's session instead of these helpers.
export async function getTemporaryOrganization() {
  const [organization] = await db
    .select({ id: organizations.id, name: organizations.name })
    .from(organizations)
    .orderBy(asc(organizations.createdAt))
    .limit(1);

  return organization ?? null;
}

export async function getTemporaryOrganizationId() {
  const organization = await getTemporaryOrganization();
  return organization?.id ?? null;
}
