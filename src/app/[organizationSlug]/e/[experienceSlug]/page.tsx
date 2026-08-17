import { notFound } from "next/navigation";
import { ExperienceAdminFab } from "@/components/experiences/experience-admin-fab";
import { ExperienceEventTracker } from "@/components/experiences/experience-event-tracker";
import { getExperienceByOrganizationAndSlug } from "@/lib/experiences/queries";
import { isCurrentUserOrganizationAdmin } from "@/lib/organizations/queries";
import { getTemplate } from "@/templates";

// Public route — deliberately outside the `experiences/` layout, so it
// never gets the authenticated dashboard shell and never calls
// `getOrganizationForCurrentUser` (no auth/membership check gates this
// page, by design: anyone with the link can view a published Experience).
// It does optionally check membership below, but only to decide whether to
// show the admin edit affordance — never to block rendering.
export default async function ExperiencePage(
  props: PageProps<"/[organizationSlug]/e/[experienceSlug]">,
) {
  const { organizationSlug, experienceSlug } = await props.params;

  // A single query scoped by both the organization slug and the experience
  // slug — an unknown organization and an unknown experience within a real
  // organization both just come back `null` here, so neither can be used to
  // probe whether a given organization or experience exists.
  const experience = await getExperienceByOrganizationAndSlug(
    organizationSlug,
    experienceSlug,
  );
  if (!experience) {
    notFound();
  }

  const template = getTemplate(experience.template);
  if (!template) {
    throw new Error(
      `Unknown template "${experience.template}" for experience "${experienceSlug}".`,
    );
  }

  const result = template.schema.safeParse(experience.data);
  if (!result.success) {
    throw new Error(
      `Invalid data for experience "${experienceSlug}" (template "${experience.template}"): ${result.error.message}`,
    );
  }

  const isAdmin = await isCurrentUserOrganizationAdmin(
    experience.organizationId,
  );

  const Component = template.component;
  return (
    <ExperienceEventTracker
      organizationSlug={organizationSlug}
      experienceSlug={experienceSlug}
    >
      <Component data={result.data} />
      {isAdmin && (
        <ExperienceAdminFab
          experience={{
            id: experience.id,
            template: experience.template,
            data: experience.data,
          }}
        />
      )}
    </ExperienceEventTracker>
  );
}
