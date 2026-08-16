import { notFound, redirect } from "next/navigation";
import { getOrganizationForCurrentUser } from "@/lib/organizations/queries";

// There's no dedicated organization home yet — land on the Experiences
// list, the only section that exists so far.
export default async function OrganizationHomePage(
  props: PageProps<"/[organizationSlug]">,
) {
  const { organizationSlug } = await props.params;

  const organization = await getOrganizationForCurrentUser(organizationSlug);
  if (!organization) {
    notFound();
  }

  redirect(`/${organization.slug}/experiences`);
}
