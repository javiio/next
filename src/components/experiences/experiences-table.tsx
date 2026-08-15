import Link from "next/link";
import { MoreHorizontalIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
}: {
  experiences: Experience[];
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
            <Link href="/dashboard/experiences/new">New experience</Link>
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
        {experiences.map((experience) => (
          <TableRow key={experience.id}>
            <TableCell className="font-medium">
              {getExperienceDisplayName(experience.data, experience.slug)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {experience.template}
            </TableCell>
            <TableCell>
              <Badge variant={statusBadgeVariant[experience.status] ?? "outline"}>
                {experience.status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {updatedAtFormatter.format(experience.updatedAt)}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/e/${experience.slug}`}>View</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/experiences/${experience.id}`}>
                      Edit
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
