import {
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const experiences = pgTable(
  "experiences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),

    template: text("template").notNull(),
    slug: text("slug").notNull(),
    data: jsonb("data").notNull().default({}),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Slugs are scoped per-organization (the public URL is
    // `/[organizationSlug]/e/[slug]`), so two different organizations can
    // both have a `proposal` experience — but not the same organization
    // twice.
    unique("experiences_org_slug_unique").on(table.organizationId, table.slug),
  ],
).enableRLS();
