import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { experiences } from "@/lib/db/schema";
import { getExperienceDisplayName } from "@/lib/experiences/display";
import { ExperienceRowActions } from "./experience-row-actions";

type Experience = typeof experiences.$inferSelect;

const statusBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
};

const updatedAtFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

export function ExperiencesTable({
  experiences,
  organizationSlug,
}: {
  experiences: Experience[];
  organizationSlug: string;
}) {
  if (experiences.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No experiences yet</EmptyTitle>
          <EmptyDescription>
            Create your first experience to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href={`/${organizationSlug}/experiences/new`}>
              New experience
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Template</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {experiences.map((experience) => {
          const displayName = getExperienceDisplayName(
            experience.data,
            experience.slug,
          );

          return (
            <TableRow key={experience.id}>
              <TableCell className="font-medium">{displayName}</TableCell>
              <TableCell className="text-muted-foreground">
                {experience.template}
              </TableCell>
              <TableCell>
                <Badge
                  variant={statusBadgeVariant[experience.status] ?? "outline"}
                >
                  {experience.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {updatedAtFormatter.format(experience.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <ExperienceRowActions
                  experienceId={experience.id}
                  slug={experience.slug}
                  name={displayName}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
