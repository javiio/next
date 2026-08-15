import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExperiencesTable } from "@/components/experiences/experiences-table";
import { getExperiencesByOrganization } from "@/lib/experiences/queries";
import { getTemporaryOrganizationId } from "@/lib/organizations/queries";

// This reads directly from Postgres (not `fetch`), so without this Next.js
// would prerender the list once at build time instead of on every request.
export const dynamic = "force-dynamic";

export default async function ExperiencesPage() {
  // TODO: replace with the organization from the authenticated user's session.
  const organizationId = await getTemporaryOrganizationId();
  const experiences = organizationId
    ? await getExperiencesByOrganization(organizationId)
    : [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Experiences</h1>
        <Button asChild>
          <Link href="/dashboard/experiences/new">New experience</Link>
        </Button>
      </div>
      <ExperiencesTable experiences={experiences} />
    </div>
  );
}
