import { eq } from "drizzle-orm";
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
