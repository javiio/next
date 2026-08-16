import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getOrganizationForCurrentUser } from "@/lib/organizations/queries";

// This reads directly from Postgres (not `fetch`), so without this Next.js
// would prerender the shell once at build time instead of on every request.
export const dynamic = "force-dynamic";

// The one place that resolves `organizationSlug` -> organization for every
// page nested under it (the experiences list, the new/edit forms). Pages
// don't repeat this lookup themselves — they call the same (request-cached)
// `getOrganizationForCurrentUser` again and get the memoized result.
export default async function OrganizationLayout({
  children,
  params,
}: LayoutProps<"/[organizationSlug]/experiences">) {
  const { organizationSlug } = await params;

  const organization = await getOrganizationForCurrentUser(organizationSlug);
  if (!organization) {
    // Covers both "no such organization" and "authenticated, but not a
    // member of this one" — the response is identical either way so a
    // non-member can't use it to probe which organization slugs exist.
    notFound();
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          variant="inset"
          organizationName={organization.name}
          organizationSlug={organization.slug}
        />
        <SidebarInset>
          <SiteHeader organizationSlug={organization.slug} />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
