import { notFound } from "next/navigation";
import { ExperienceForm } from "@/components/experiences/experience-form";
import { getExperienceByIdForOrganization } from "@/lib/experiences/queries";
import { getCurrentOrganization } from "@/lib/organizations/queries";

// This reads directly from Postgres (not `fetch`), so without this Next.js
// would prerender the page once at build time instead of on every request.
export const dynamic = "force-dynamic";

export default async function EditExperiencePage(
  props: PageProps<"/dashboard/experiences/[id]">,
) {
  const { id } = await props.params;

  const organization = await getCurrentOrganization();
  const experience = await getExperienceByIdForOrganization(
    id,
    organization.id,
  );

  if (!experience) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Edit experience</h1>
      <ExperienceForm
        experience={{
          id: experience.id,
          template: experience.template,
          data: experience.data,
        }}
      />
    </div>
  );
}
