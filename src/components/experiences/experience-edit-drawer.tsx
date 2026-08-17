"use client";

import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ExperienceForm } from "@/components/experiences/experience-form";

// Shared between the experiences list (row click) and the public Experience
// page (admin floating action button) so both surfaces edit through the
// exact same Drawer + form.
export function ExperienceEditDrawer({
  experience,
  open,
  onOpenChange,
}: {
  experience: {
    id: string;
    template: string;
    data: unknown;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit experience</DrawerTitle>
          <DrawerDescription>
            Update this experience&apos;s details.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <ExperienceForm
            key={experience.id}
            experience={experience}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => {
              onOpenChange(false);
              router.refresh();
            }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
