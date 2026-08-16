import { LayoutGrid, type LucideIcon } from "lucide-react";

export type DashboardNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

// Primary sidebar navigation. This is the single source of truth for both
// the sidebar links and the header title lookup below — every URL is built
// from the current organization's slug rather than hardcoded, so this list
// stays correct regardless of which organization is being viewed.
//
// Future sections (Clients, Templates, Settings) can be added here once
// they exist — everything that reads this list will pick them up.
export function getDashboardNavItems(
  organizationSlug: string,
): DashboardNavItem[] {
  return [
    {
      title: "Experiences",
      url: `/${organizationSlug}/experiences`,
      icon: LayoutGrid,
    },
  ];
}
