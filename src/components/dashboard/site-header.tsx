"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getDashboardNavItems } from "./nav-items";

function getPageTitle(pathname: string, organizationSlug: string) {
  const activeItem = getDashboardNavItems(organizationSlug).find(
    (item) => pathname === item.url || pathname.startsWith(`${item.url}/`),
  );

  return activeItem?.title ?? "Dashboard";
}

export function SiteHeader({
  organizationSlug,
}: {
  organizationSlug: string;
}) {
  const pathname = usePathname();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">
          {getPageTitle(pathname, organizationSlug)}
        </h1>
      </div>
    </header>
  );
}
