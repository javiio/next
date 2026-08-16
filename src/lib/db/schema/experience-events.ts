import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { experiences } from "./experiences";
import { organizations } from "./organizations";

// One row per tracked interaction on a public Experience (a page view, a CTA
// click, etc). `eventType` is a plain string — not a pg enum — validated
// against the registry in `@/lib/experience-events/event-types`, the same
// way `experiences.template` is validated against the template registry
// instead of a db enum. That keeps adding a new event type a pure app-level
// change (add a schema to the registry) rather than a migration.
//
// `eventData` is JSONB for the same reason: each event type has its own
// (Zod-validated) shape — e.g. `{ cta: "accept-proposal" }` for
// `cta_clicked` — without ever widening this table's columns.
export const experienceEvents = pgTable(
  "experience_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Denormalized alongside `experienceId` so organization-scoped analytics
    // queries (and the RLS policy below) don't need to join through
    // `experiences` just to filter by organization.
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    experienceId: uuid("experience_id")
      .notNull()
      .references(() => experiences.id, { onDelete: "cascade" }),

    eventType: text("event_type").notNull(),
    eventData: jsonb("event_data").notNull().default({}),

    // Identify the same browser (`visitorId`, persisted long-term) and the
    // same visit (`sessionId`, cleared when the browser closes) without
    // requiring an account — see `@/lib/experience-events/client`. Neither
    // is a foreign key: they're opaque, client-generated identifiers, not
    // rows in another table.
    visitorId: uuid("visitor_id").notNull(),
    sessionId: uuid("session_id").notNull(),

    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    userAgent: text("user_agent"),
    referrer: text("referrer"),
  },
  (table) => [
    // The common analytics query shape: "events for this Experience, of
    // this type, over time" (e.g. counting `viewed` vs `cta_clicked` per
    // day for a single Experience).
    index("experience_events_experience_type_occurred_at_idx").on(
      table.experienceId,
      table.eventType,
      table.occurredAt,
    ),
    // Organization-wide rollups across all of an org's Experiences.
    index("experience_events_organization_id_idx").on(table.organizationId),
    // Funnel-style analysis (e.g. "did this visitor who viewed also click
    // the CTA?") groups by visitor.
    index("experience_events_visitor_id_idx").on(table.visitorId),
  ],
).enableRLS();
