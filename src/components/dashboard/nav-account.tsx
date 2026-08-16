import { Building2 } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Displays the signed-in user's current organization at the bottom of the
// sidebar. This is a static placeholder for the user/account area — an
// account menu (sign out, switch organization, etc.) is future work.
export function NavAccount({
  organizationName,
}: {
  organizationName?: string | null;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default hover:bg-transparent active:bg-transparent"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {organizationName ?? "No organization"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Workspace
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
