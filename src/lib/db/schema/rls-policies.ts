import { type AnyColumn, sql } from "drizzle-orm";
import { pgPolicy } from "drizzle-orm/pg-core";
import { authenticatedRole, authUid } from "drizzle-orm/supabase";
import { experienceEvents } from "./experience-events";
import { experiences } from "./experiences";
import { organizationMembers } from "./organization-members";
import { organizations } from "./organizations";

// A user is a member of an organization if a matching row exists here.
const isMemberOf = (organizationId: AnyColumn) =>
  sql`exists (
    select 1 from ${organizationMembers}
    where ${organizationMembers.organizationId} = ${organizationId}
      and ${organizationMembers.userId} = ${authUid}
  )`;

// -- organization_members --------------------------------------------------
// Users can see their own memberships. Nothing else is granted: the
// first-login membership insert happens over the server-side Postgres
// connection (which bypasses RLS), not via a client-facing policy — see
// `getCurrentOrganization()`.
export const organizationMembersSelectOwn = pgPolicy(
  "organization_members_select_own",
  {
    for: "select",
    to: authenticatedRole,
    using: sql`${organizationMembers.userId} = ${authUid}`,
  },
).link(organizationMembers);

// -- organizations -----------------------------------------------------------
// Visible only to members. Creation/updates/deletes are out of scope for now
// (no policy => denied for authenticated/anon).
export const organizationsSelectMember = pgPolicy(
  "organizations_select_member",
  {
    for: "select",
    to: authenticatedRole,
    using: isMemberOf(organizations.id),
  },
).link(organizations);

// -- experiences --------------------------------------------------------------
// Full CRUD for any member of the owning organization.
export const experiencesSelectMember = pgPolicy("experiences_select_member", {
  for: "select",
  to: authenticatedRole,
  using: isMemberOf(experiences.organizationId),
}).link(experiences);

export const experiencesInsertMember = pgPolicy("experiences_insert_member", {
  for: "insert",
  to: authenticatedRole,
  withCheck: isMemberOf(experiences.organizationId),
}).link(experiences);

export const experiencesUpdateMember = pgPolicy("experiences_update_member", {
  for: "update",
  to: authenticatedRole,
  using: isMemberOf(experiences.organizationId),
  withCheck: isMemberOf(experiences.organizationId),
}).link(experiences);

export const experiencesDeleteMember = pgPolicy("experiences_delete_member", {
  for: "delete",
  to: authenticatedRole,
  using: isMemberOf(experiences.organizationId),
}).link(experiences);

// -- experience_events ---------------------------------------------------
// Read-only for members of the owning organization — events are analytics
// data, not something members edit by hand. There's deliberately no
// insert/update/delete policy: rows are only ever written by
// `trackExperienceEvent` over the server-side Postgres connection (which
// bypasses RLS), never by a client-facing (anon/authenticated) role. That's
// what stops a visitor from writing arbitrary events directly.
export const experienceEventsSelectMember = pgPolicy(
  "experience_events_select_member",
  {
    for: "select",
    to: authenticatedRole,
    using: isMemberOf(experienceEvents.organizationId),
  },
).link(experienceEvents);
