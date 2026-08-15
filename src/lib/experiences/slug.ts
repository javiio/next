import { getExperienceBySlug } from "./queries";

export function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents (e.g. "é" -> "e")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "experience";
}

// There's no unique constraint on `experiences.slug` yet, so uniqueness is
// enforced here at the application layer instead of the database.
//
// `excludeId` lets a slug regenerated while editing an experience ignore a
// collision with that same experience's own current slug.
export async function generateUniqueSlug(
  name: string,
  options?: { excludeId?: string },
): Promise<string> {
  const base = slugify(name);

  let candidate = base;
  let attempt = 2;

  while (true) {
    const existing = await getExperienceBySlug(candidate);
    if (!existing || existing.id === options?.excludeId) {
      break;
    }

    candidate = `${base}-${attempt}`;
    attempt += 1;
  }

  return candidate;
}
