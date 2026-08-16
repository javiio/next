import { z } from "zod";

// The single source of truth for which Experience event types exist and
// what shape their `eventData` must have. Adding a new event type (e.g.
// `link_clicked`) is just adding an entry here — no db migration, no enum
// to widen. This mirrors how `@/templates` registers templates by id.
export const experienceEventSchemas = {
  // Fired once per page load of a public Experience.
  viewed: z.object({}),
  // Fired when a visitor clicks a call-to-action. `cta` identifies which
  // one, e.g. "accept-proposal" — templates choose their own ids.
  cta_clicked: z.object({
    cta: z.string().trim().min(1),
  }),
} satisfies Record<string, z.ZodType>;

export type ExperienceEventType = keyof typeof experienceEventSchemas;

export type ExperienceEventData = {
  [K in ExperienceEventType]: z.infer<(typeof experienceEventSchemas)[K]>;
};

export function isExperienceEventType(
  value: string,
): value is ExperienceEventType {
  return value in experienceEventSchemas;
}
