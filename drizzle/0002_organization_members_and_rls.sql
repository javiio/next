CREATE TYPE "public"."organization_member_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "organization_member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_members_org_user_unique" UNIQUE("organization_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "organization_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "experiences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "experiences_delete_member" ON "experiences" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (
    select 1 from "organization_members"
    where "organization_members"."organization_id" = "experiences"."organization_id"
      and "organization_members"."user_id" = (select auth.uid())
  ));--> statement-breakpoint
CREATE POLICY "experiences_insert_member" ON "experiences" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (
    select 1 from "organization_members"
    where "organization_members"."organization_id" = "experiences"."organization_id"
      and "organization_members"."user_id" = (select auth.uid())
  ));--> statement-breakpoint
CREATE POLICY "experiences_select_member" ON "experiences" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
    select 1 from "organization_members"
    where "organization_members"."organization_id" = "experiences"."organization_id"
      and "organization_members"."user_id" = (select auth.uid())
  ));--> statement-breakpoint
CREATE POLICY "experiences_update_member" ON "experiences" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (
    select 1 from "organization_members"
    where "organization_members"."organization_id" = "experiences"."organization_id"
      and "organization_members"."user_id" = (select auth.uid())
  )) WITH CHECK (exists (
    select 1 from "organization_members"
    where "organization_members"."organization_id" = "experiences"."organization_id"
      and "organization_members"."user_id" = (select auth.uid())
  ));--> statement-breakpoint
CREATE POLICY "organizations_select_member" ON "organizations" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
    select 1 from "organization_members"
    where "organization_members"."organization_id" = "organizations"."id"
      and "organization_members"."user_id" = (select auth.uid())
  ));--> statement-breakpoint
CREATE POLICY "organization_members_select_own" ON "organization_members" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("organization_members"."user_id" = (select auth.uid()));