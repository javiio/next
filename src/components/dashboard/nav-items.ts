import { LayoutGrid, type LucideIcon } from "lucide-react";

export type DashboardNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

// Primary sidebar navigation. This is the single source of truth for both
// the sidebar links and the header title lookup below.
//
// Future sections (Clients, Templates, Settings) can be added here once
// they exist — everything that reads this list will pick them up.
export const dashboardNavItems: DashboardNavItem[] = [
  { title: "Experiences", url: "/dashboard/experiences", icon: LayoutGrid },
];
