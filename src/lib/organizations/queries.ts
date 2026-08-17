import { asc, and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { organizationMembers, organizations } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export type CurrentOrganization = {
  id: string;
  name: string;
  slug: string;
};

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

async function getOrganizationBySlug(
  slug: string,
): Promise<CurrentOrganization | null> {
  const [row] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
    })
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);

  return row ?? null;
}

async function findOrganizationForMember(
  userId: string,
): Promise<CurrentOrganization | null> {
  const [row] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizations.id, organizationMembers.organizationId),
    )
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  return row ?? null;
}

async function isMemberOfOrganization(userId: string, organizationId: string) {
  const [row] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId),
      ),
    )
    .limit(1);

  return !!row;
}

async function hasAnyMembership(userId: string) {
  const [row] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  return !!row;
}

// Temporary onboarding rule for as long as there's no organization
// creation/invitation/switching flow: a user with no memberships anywhere is
// made the `owner` of whichever organization they land on (there's only one
// organization in the system for now, so this is unambiguous). Idempotent
// via `onConflictDoNothing` so concurrent requests from the same first-time
// user can't race into duplicate (or failing) inserts — the unique
// constraint on (organization_id, user_id) is the actual guarantee here.
async function assignUserToOrganization(
  userId: string,
  organizationId: string,
) {
  await db
    .insert(organizationMembers)
    .values({ organizationId, userId, role: "owner" })
    .onConflictDoNothing();
}

// The entry point for routes that don't yet have an organization slug in
// their URL (e.g. the root `/`). Resolves "the" organization for the
// signed-in user — today that's their only membership (assigning one via
// `assignFirstOrganization` below if they don't have one yet) — so callers
// can redirect into that organization's URL-scoped routes.
//
// This is intentionally the *only* place that picks an organization without
// being told which one via the URL. Once organization switching exists,
// this is where "last active organization" (or similar) would be resolved.
export async function getCurrentOrganization(): Promise<CurrentOrganization> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
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

async function assignFirstOrganization(
  userId: string,
): Promise<CurrentOrganization | null> {
  const [organization] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
    })
    .from(organizations)
    .orderBy(asc(organizations.createdAt))
    .limit(1);

  if (!organization) {
    return null;
  }

  await assignUserToOrganization(userId, organization.id);
  return organization;
}

// For public routes (e.g. the public Experience page) that want to
// conditionally show admin-only UI (like an edit affordance) without the
// login redirect `getOrganizationForCurrentUser` performs — anonymous
// visitors are a normal case there, not an error. There's no dedicated
// "admin" role yet (see `organizationMemberRole`), so any membership
// (`owner` or `member`) qualifies, matching the access every other
// experiences action already grants org members.
export async function isCurrentUserOrganizationAdmin(
  organizationId: string,
): Promise<boolean> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return false;
  }

  return isMemberOfOrganization(userId, organizationId);
}

// The entry point for every organization-scoped URL
// (`/[organizationSlug]/...`). This is where the "authenticated user →
// organization membership → organization from URL" check described in the
// routing plan happens — the URL's slug is never trusted on its own.
//
// Cached per-request (React's `cache`) so the organization-scoped layout and
// the pages/actions nested under it can all call this with the same slug
// without re-running the membership check/query more than once per request.
//
// Returns `null` when the organization doesn't exist *or* the signed-in
// user isn't a member of it — callers should respond with `notFound()`
// either way, so a non-member can't distinguish "wrong org" from "org
// doesn't exist".
export const getOrganizationForCurrentUser = cache(
  async (organizationSlug: string): Promise<CurrentOrganization | null> => {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      redirect("/login");
    }

    const organization = await getOrganizationBySlug(organizationSlug);
    if (!organization) {
      return null;
    }

    if (await isMemberOfOrganization(userId, organization.id)) {
      return organization;
    }

    // Same temporary onboarding rule as `getCurrentOrganization()`, applied
    // to the organization the user is actually trying to visit: a user with
    // no memberships anywhere yet is assigned to it rather than left
    // locked out of the only organization that exists.
    if (!(await hasAnyMembership(userId))) {
      await assignUserToOrganization(userId, organization.id);
      return organization;
    }

    return null;
  },
);
