import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";

// Temporary stand-in for auth-derived organization context. Once
// authentication exists, callers should get the organization id from the
// signed-in user's session instead of this helper.
export async function getTemporaryOrganizationId() {
  const [organization] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .orderBy(asc(organizations.createdAt))
    .limit(1);

  return organization?.id ?? null;
}
