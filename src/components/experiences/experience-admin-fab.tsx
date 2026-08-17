"use client";

import { useState } from "react";
import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExperienceEditDrawer } from "@/components/experiences/experience-edit-drawer";

// Rendered on the public Experience page only when the viewer is signed in
// and is a member of the owning organization (see
// `isCurrentUserOrganizationAdmin`) — opens the same edit Drawer used from
// the experiences list.
export function ExperienceAdminFab({
  experience,
}: {
  experience: {
    id: string;
    template: string;
    data: unknown;
  };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="icon"
        className="fixed right-6 bottom-6 z-50 size-12 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <SettingsIcon />
        <span className="sr-only">Edit experience</span>
      </Button>

      <ExperienceEditDrawer
        experience={experience}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
