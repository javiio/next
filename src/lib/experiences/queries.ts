import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { experiences } from "@/lib/db/schema";

export async function getExperienceBySlug(slug: string) {
  const [experience] = await db
    .select()
    .from(experiences)
    .where(eq(experiences.slug, slug))
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
