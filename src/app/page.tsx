import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/organizations/queries";

// No marketing site yet: the root just routes you to the right place.
// `getCurrentOrganization()` redirects to `/login` on its own when there's
// no signed-in user, so there's no separate auth check needed here. Once
// organization switching exists, this is the one spot that would need to
// change (e.g. to a "last active organization" lookup) — everything
// downstream already keys off the URL's organization slug.
export default async function Home() {
  const organization = await getCurrentOrganization();
  redirect(`/${organization.slug}/experiences`);
}
