import { getExperienceByOrganizationIdAndSlug } from "./queries";

export function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents (e.g. "é" -> "e")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "experience";
}

// Slugs only need to be unique within an organization (there's a
// `UNIQUE (organization_id, slug)` constraint backing this at the database
// level), so the collision check below is scoped the same way — a
// `proposal` slug in one organization never blocks a `proposal` slug in
// another.
//
// `excludeId` lets a slug regenerated while editing an experience ignore a
// collision with that same experience's own current slug.
export async function generateUniqueSlug(
  organizationId: string,
  name: string,
  options?: { excludeId?: string },
): Promise<string> {
  const base = slugify(name);

  let candidate = base;
  let attempt = 2;

  while (true) {
    const existing = await getExperienceByOrganizationIdAndSlug(
      organizationId,
      candidate,
    );
    if (!existing || existing.id === options?.excludeId) {
      break;
    }

    candidate = `${base}-${attempt}`;
    attempt += 1;
  }

  return candidate;
}
