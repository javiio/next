import { pgEnum, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { organizations } from "./organizations";

// Intentionally simple for now: every member is either the org's `owner` or
// a plain `member`. No per-permission role management yet.
export const organizationMemberRole = pgEnum("organization_member_role", [
  "owner",
  "member",
]);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    // References Supabase's `auth.users`, not a table we manage — see
    // `drizzle-orm/supabase`'s `authUsers` and `schemaFilter` in
    // drizzle.config.ts.
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    role: organizationMemberRole("role").notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // A user can only belong to a given organization once.
    unique("organization_members_org_user_unique").on(
      table.organizationId,
      table.userId,
    ),
  ],
).enableRLS();
