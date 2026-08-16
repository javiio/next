import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { experiences, organizations } from "@/lib/db/schema";

// Public lookup for `/[organizationSlug]/e/[experienceSlug]`. Scoped by both
// the organization slug and the experience slug in a single query so a
// non-existent organization and a non-existent experience within a real
// organization are indistinguishable to the caller — both just come back
// `null`, and both should result in `notFound()`.
export async function getExperienceByOrganizationAndSlug(
  organizationSlug: string,
  experienceSlug: string,
) {
  const [experience] = await db
    .select({
      id: experiences.id,
      organizationId: experiences.organizationId,
      template: experiences.template,
      slug: experiences.slug,
      data: experiences.data,
      status: experiences.status,
      createdAt: experiences.createdAt,
      updatedAt: experiences.updatedAt,
    })
    .from(experiences)
    .innerJoin(organizations, eq(organizations.id, experiences.organizationId))
    .where(
      and(
        eq(organizations.slug, organizationSlug),
        eq(experiences.slug, experienceSlug),
      ),
    )
    .limit(1);

  return experience ?? null;
}

// Scoped to an organization id so a slug collision check never looks across
// organization boundaries — `generateUniqueSlug` relies on this.
export async function getExperienceByOrganizationIdAndSlug(
  organizationId: string,
  slug: string,
) {
  const [experience] = await db
    .select()
    .from(experiences)
    .where(
      and(
        eq(experiences.organizationId, organizationId),
        eq(experiences.slug, slug),
      ),
    )
    .limit(1);

  return experience ?? null;
}

export async function getExperiencesByOrganization(organizationId: string) {
  return db
    .select()
    .from(experiences)
    .where(eq(experiences.organizationId, organizationId))
    .orderBy(desc(experiences.updatedAt));
}

// Scoped to an organization so callers can't read (or, via the actions that
// build on this, update/delete) an Experience owned by a different org just
// by knowing its id.
export async function getExperienceByIdForOrganization(
  id: string,
  organizationId: string,
) {
  const [experience] = await db
    .select()
    .from(experiences)
    .where(
      and(eq(experiences.id, id), eq(experiences.organizationId, organizationId)),
    )
    .limit(1);

  return experience ?? null;
}
