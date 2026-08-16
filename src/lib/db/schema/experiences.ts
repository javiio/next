import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const experiences = pgTable("experiences", {
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
}).enableRLS();
