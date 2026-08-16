import { asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { organizationMembers, organizations } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export type CurrentOrganization = {
  id: string;
  name: string;
};

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

async function findOrganizationForMember(
  userId: string,
): Promise<CurrentOrganization | null> {
  const [row] = await db
    .select({ id: organizations.id, name: organizations.name })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizations.id, organizationMembers.organizationId),
    )
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  return row ?? null;
}

// Temporary onboarding rule for as long as there's no organization
// creation/invitation/switching flow: a first-time user is made the `owner`
// of the single existing organization. Idempotent via `onConflictDoNothing`
// so concurrent requests from the same first-time user can't race into
// duplicate (or failing) inserts — the unique constraint on
// (organization_id, user_id) is the actual guarantee here.
async function assignFirstOrganization(
  userId: string,
): Promise<CurrentOrganization | null> {
  const [organization] = await db
    .select({ id: organizations.id, name: organizations.name })
    .from(organizations)
    .orderBy(asc(organizations.createdAt))
    .limit(1);

  if (!organization) {
    return null;
  }

  await db
    .insert(organizationMembers)
    .values({
      organizationId: organization.id,
      userId,
      role: "owner",
    })
    .onConflictDoNothing();

  return organization;
}

// The single entry point the rest of the app should use to find out which
// organization the signed-in user is operating in. Callers never need to
// know about the first-login assignment rule above, or how membership is
// stored — they just get an organization back (or an unauthenticated
// redirect/error).
export async function getCurrentOrganization(): Promise<CurrentOrganization> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    // Mirrors the unauthenticated handling in `src/app/page.tsx`. Every
    // caller of this function runs behind the dashboard, so bouncing to
    // /login here also means individual pages/actions don't need their own
    // auth checks.
    redirect("/login");
  }

  const membership = await findOrganizationForMember(userId);
  if (membership) {
    return membership;
  }

  const assigned = await assignFirstOrganization(userId);
  if (!assigned) {
    throw new Error(
      "No organization exists yet to assign the signed-in user to.",
    );
  }

  return assigned;
}
