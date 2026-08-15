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
import { dashboardNavItems } from "./nav-items";

export function AppSidebar({
  organizationName,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  organizationName?: string | null;
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
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
        <NavMain items={dashboardNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavAccount organizationName={organizationName} />
      </SidebarFooter>
    </Sidebar>
  );
}
