"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { experiences } from "@/lib/db/schema";
import { getTemplate } from "@/templates";
import { getExperienceByOrganizationAndSlug } from "./queries";

const updatePublicExperienceNameInputSchema = z.object({
  organizationSlug: z.string().trim().min(1),
  experienceSlug: z.string().trim().min(1),
  name: z.string().trim().min(1).max(200),
});

export type UpdatePublicExperienceNameResult =
  | { status: "success" }
  | { status: "error"; message: string };

// The public counterpart to `updateExperience` in `./actions` — reachable by
// any visitor of a public Experience page, not just signed-in org members
// (mirrors the trust model of `trackExperienceEvent`). Every input is
// treated as untrusted and re-validated here: `organizationSlug` /
// `experienceSlug` are re-resolved to a real Experience server-side rather
// than trusting a client-supplied id, and only `name` can ever be written —
// there's no way to reach any other part of a template's `data` through this
// action. The Experience's `slug` (its public URL) is deliberately left
// untouched, unlike the admin flow's slug regeneration — a visitor renaming
// themselves must never break the link they're currently viewing.
export async function updatePublicExperienceName(
  input: z.infer<typeof updatePublicExperienceNameInputSchema>,
): Promise<UpdatePublicExperienceNameResult> {
  const parsedInput = updatePublicExperienceNameInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { status: "error", message: "Please enter a valid name." };
  }
  const { organizationSlug, experienceSlug, name } = parsedInput.data;

  const experience = await getExperienceByOrganizationAndSlug(
    organizationSlug,
    experienceSlug,
  );
  if (!experience) {
    return { status: "error", message: "Experience not found." };
  }

  const template = getTemplate(experience.template);
  if (!template) {
    return { status: "error", message: "Experience not found." };
  }

  const existingData =
    experience.data && typeof experience.data === "object"
      ? (experience.data as Record<string, unknown>)
      : {};

  // Re-validate the *entire* merged object against the template's own
  // schema — the same source of truth `updateExperience` uses — so a public
  // edit can never produce data the template wouldn't otherwise accept, and
  // a template without a `name` field is rejected instead of silently
  // writing one it will never render.
  const parsedData = template.schema.safeParse({ ...existingData, name });
  if (
    !parsedData.success ||
    !("name" in parsedData.data) ||
    (parsedData.data as Record<string, unknown>).name !== name
  ) {
    return {
      status: "error",
      message: "This experience doesn't support editing the name.",
    };
  }

  try {
    await db
      .update(experiences)
      .set({ data: parsedData.data, updatedAt: new Date() })
      .where(eq(experiences.id, experience.id));
  } catch {
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }

  revalidatePath(`/${organizationSlug}/e/${experienceSlug}`);
  revalidatePath(`/${organizationSlug}/experiences`);

  return { status: "success" };
}
