"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavAccount } from "./nav-account";
import { NavMain } from "./nav-main";
import { getDashboardNavItems } from "./nav-items";

export function AppSidebar({
  organizationName,
  organizationSlug,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  organizationName?: string | null;
  organizationSlug: string;
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`/${organizationSlug}`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <span className="text-base font-semibold">Creator</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getDashboardNavItems(organizationSlug)} />
      </SidebarContent>
      <SidebarFooter>
        <NavAccount organizationName={organizationName} />
      </SidebarFooter>
    </Sidebar>
  );
}
