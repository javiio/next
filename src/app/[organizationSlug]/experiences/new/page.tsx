import { notFound } from "next/navigation";
import { ExperienceForm } from "@/components/experiences/experience-form";
import { getOrganizationForCurrentUser } from "@/lib/organizations/queries";

export default async function NewExperiencePage(
  props: PageProps<"/[organizationSlug]/experiences/new">,
) {
  const { organizationSlug } = await props.params;

  const organization = await getOrganizationForCurrentUser(organizationSlug);
  if (!organization) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">New experience</h1>
      <ExperienceForm />
    </div>
  );
}
