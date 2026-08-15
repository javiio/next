"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { experiences } from "@/lib/db/schema";
import { getTemporaryOrganizationId } from "@/lib/organizations/queries";
import { getTemplate } from "@/templates";
import { getExperienceNameForSlug } from "./display";
import { getExperienceByIdForOrganization } from "./queries";
import { generateUniqueSlug } from "./slug";

export type ExperienceFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

// Fields on the form that aren't part of the template's own data.
const NON_TEMPLATE_FIELDS = new Set(["templateId", "experienceId"]);

function extractTemplateData(formData: FormData) {
  return Object.fromEntries(
    Array.from(formData.entries()).filter(
      ([key]) => !NON_TEMPLATE_FIELDS.has(key),
    ),
  );
}

export async function createExperience(
  _prevState: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  const templateId = formData.get("templateId");

  if (typeof templateId !== "string" || templateId.trim().length === 0) {
    return { status: "error", message: "Select a template." };
  }

  const template = getTemplate(templateId);
  if (!template) {
    return { status: "error", message: `Unknown template "${templateId}".` };
  }

  // The template's own schema is the single source of truth for validating
  // its data.
  const parsed = template.schema.safeParse(extractTemplateData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  // TODO: replace with the organization from the authenticated user's session.
  const organizationId = await getTemporaryOrganizationId();
  if (!organizationId) {
    return {
      status: "error",
      message: "No organization found. Create one before adding experiences.",
    };
  }

  const slug = await generateUniqueSlug(getExperienceNameForSlug(parsed.data));

  let experienceId: string;
  try {
    const [experience] = await db
      .insert(experiences)
      .values({
        organizationId,
        template: templateId,
        slug,
        data: parsed.data,
        status: "draft",
      })
      .returning({ id: experiences.id });

    experienceId = experience.id;
  } catch {
    return {
      status: "error",
      message: "Something went wrong while saving. Please try again.",
    };
  }

  redirect(`/dashboard/experiences/${experienceId}`);
}

export async function updateExperience(
  _prevState: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  const experienceId = formData.get("experienceId");
  if (typeof experienceId !== "string" || experienceId.trim().length === 0) {
    return { status: "error", message: "Missing experience id." };
  }

  // TODO: replace with the organization from the authenticated user's session.
  const organizationId = await getTemporaryOrganizationId();
  if (!organizationId) {
    return { status: "error", message: "No organization found." };
  }

  const existing = await getExperienceByIdForOrganization(
    experienceId,
    organizationId,
  );
  if (!existing) {
    return { status: "error", message: "Experience not found." };
  }

  // The template is fixed at creation time — resolve it from the existing
  // row rather than trusting anything the client submitted, and keep it and
  // `status` unchanged in the update below.
  const template = getTemplate(existing.template);
  if (!template) {
    return {
      status: "error",
      message: `Unknown template "${existing.template}".`,
    };
  }

  const parsed = template.schema.safeParse(extractTemplateData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const previousName = getExperienceNameForSlug(existing.data);
  const nextName = getExperienceNameForSlug(parsed.data);
  const slug =
    nextName === previousName
      ? existing.slug
      : await generateUniqueSlug(nextName, { excludeId: existing.id });

  try {
    await db
      .update(experiences)
      .set({ data: parsed.data, slug, updatedAt: new Date() })
      .where(eq(experiences.id, existing.id));
  } catch {
    return {
      status: "error",
      message: "Something went wrong while saving. Please try again.",
    };
  }

  revalidatePath("/dashboard/experiences");
  redirect(`/dashboard/experiences/${existing.id}`);
}

export type DeleteExperienceResult = {
  status: "idle" | "error";
  message?: string;
};

export async function deleteExperience(
  experienceId: string,
): Promise<DeleteExperienceResult> {
  // TODO: replace with the organization from the authenticated user's session.
  const organizationId = await getTemporaryOrganizationId();
  if (!organizationId) {
    return { status: "error", message: "No organization found." };
  }

  // Scoping this lookup to the organization is what prevents deleting an
  // Experience that belongs to someone else just by guessing/knowing its id.
  const existing = await getExperienceByIdForOrganization(
    experienceId,
    organizationId,
  );
  if (!existing) {
    return { status: "error", message: "Experience not found." };
  }

  try {
    await db.delete(experiences).where(eq(experiences.id, existing.id));
  } catch {
    return {
      status: "error",
      message: "Something went wrong while deleting. Please try again.",
    };
  }

  revalidatePath("/dashboard/experiences");
  return { status: "idle" };
}
