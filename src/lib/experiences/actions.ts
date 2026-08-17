"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { experiences } from "@/lib/db/schema";
import { getOrganizationForCurrentUser } from "@/lib/organizations/queries";
import { getTemplate } from "@/templates";
import { extractSchemaFormData } from "@/templates/schema-form-data";
import { getExperienceNameForSlug } from "./display";
import { getExperienceByIdForOrganization } from "./queries";
import { generateUniqueSlug } from "./slug";

export type ExperienceFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

// `organizationSlug` is supplied via `.bind()` at the call site (see
// `ExperienceForm`, which reads it from the URL with `useParams()` rather
// than a prop) instead of a `formData` field. Either way it's just a
// UX convenience for building the right redirect URL — it's never trusted
// on its own: every action re-resolves it through
// `getOrganizationForCurrentUser`, which re-checks the signed-in user's
// membership, before touching any data.
export async function createExperience(
  organizationSlug: string,
  _prevState: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  const organization = await getOrganizationForCurrentUser(organizationSlug);
  if (!organization) {
    return { status: "error", message: "Organization not found." };
  }

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
  const parsed = template.schema.safeParse(
    extractSchemaFormData(template.schema, formData),
  );
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

  const slug = await generateUniqueSlug(
    organization.id,
    getExperienceNameForSlug(parsed.data),
  );

  let experienceId: string;
  try {
    const [experience] = await db
      .insert(experiences)
      .values({
        organizationId: organization.id,
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

  redirect(`/${organization.slug}/experiences/${experienceId}`);
}

export async function updateExperience(
  organizationSlug: string,
  _prevState: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  const organization = await getOrganizationForCurrentUser(organizationSlug);
  if (!organization) {
    return { status: "error", message: "Organization not found." };
  }

  const experienceId = formData.get("experienceId");
  if (typeof experienceId !== "string" || experienceId.trim().length === 0) {
    return { status: "error", message: "Missing experience id." };
  }

  const existing = await getExperienceByIdForOrganization(
    experienceId,
    organization.id,
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

  const parsed = template.schema.safeParse(
    extractSchemaFormData(template.schema, formData),
  );
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
      : await generateUniqueSlug(organization.id, nextName, {
          excludeId: existing.id,
        });

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

  revalidatePath(`/${organization.slug}/experiences`);
  revalidatePath(`/${organization.slug}/e/${slug}`);
  return { status: "success" };
}

export type DeleteExperienceResult = {
  status: "idle" | "error";
  message?: string;
};

export async function deleteExperience(
  organizationSlug: string,
  experienceId: string,
): Promise<DeleteExperienceResult> {
  const organization = await getOrganizationForCurrentUser(organizationSlug);
  if (!organization) {
    return { status: "error", message: "Organization not found." };
  }

  // Scoping this lookup to the organization is what prevents deleting an
  // Experience that belongs to someone else just by guessing/knowing its id.
  const existing = await getExperienceByIdForOrganization(
    experienceId,
    organization.id,
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

  revalidatePath(`/${organization.slug}/experiences`);
  return { status: "idle" };
}
