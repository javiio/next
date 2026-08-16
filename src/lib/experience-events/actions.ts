"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { experienceEvents } from "@/lib/db/schema";
import { getExperienceByOrganizationAndSlug } from "@/lib/experiences/queries";
import {
  experienceEventSchemas,
  isExperienceEventType,
  type ExperienceEventData,
  type ExperienceEventType,
} from "./event-types";

const trackExperienceEventInputSchema = z.object({
  organizationSlug: z.string().trim().min(1),
  experienceSlug: z.string().trim().min(1),
  eventType: z.string().trim().min(1),
  eventData: z.unknown(),
  visitorId: z.uuid(),
  sessionId: z.uuid(),
  referrer: z.string().trim().min(1).nullable(),
});

// The public tracking entry point for Experience pages. This is a Server
// Action, so it's reachable by anyone who can POST to it (not just from our
// own UI) — every input is treated as untrusted and re-validated here, and
// `organizationSlug`/`experienceSlug` are re-resolved to a real Experience
// server-side rather than trusting a client-supplied id, the same pattern
// used by the mutations in `@/lib/experiences/actions`.
//
// Deliberately fire-and-forget from the caller's perspective: failures are
// swallowed (returning silently) so a tracking hiccup never surfaces as a
// visible error on someone else's public page.
export async function trackExperienceEvent<T extends ExperienceEventType>(input: {
  organizationSlug: string;
  experienceSlug: string;
  eventType: T;
  eventData: ExperienceEventData[T];
  visitorId: string;
  sessionId: string;
  referrer: string | null;
}): Promise<void> {
  const parsedInput = trackExperienceEventInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return;
  }

  const { organizationSlug, experienceSlug, eventType, visitorId, sessionId, referrer } =
    parsedInput.data;

  if (!isExperienceEventType(eventType)) {
    return;
  }

  const parsedEventData = experienceEventSchemas[eventType].safeParse(
    parsedInput.data.eventData,
  );
  if (!parsedEventData.success) {
    return;
  }

  const experience = await getExperienceByOrganizationAndSlug(
    organizationSlug,
    experienceSlug,
  );
  if (!experience) {
    return;
  }

  const headersList = await headers();

  try {
    await db.insert(experienceEvents).values({
      organizationId: experience.organizationId,
      experienceId: experience.id,
      eventType,
      eventData: parsedEventData.data,
      visitorId,
      sessionId,
      userAgent: headersList.get("user-agent"),
      referrer,
    });
  } catch {
    // Never let a tracking failure bubble up to the visitor.
  }
}
