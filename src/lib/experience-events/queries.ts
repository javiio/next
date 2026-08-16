import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { experienceEvents } from "@/lib/db/schema";

// Most-recent-first, which is what an activity timeline wants. Callers are
// expected to have already scoped access to the Experience itself (e.g. via
// `getExperienceByIdForOrganization`) before calling this — there's no
// separate `organizationId` check here, same as how `getExperiencesByOrganization`
// doesn't re-check membership either.
export async function getExperienceEvents(experienceId: string) {
  return db
    .select()
    .from(experienceEvents)
    .where(eq(experienceEvents.experienceId, experienceId))
    .orderBy(desc(experienceEvents.occurredAt));
}
