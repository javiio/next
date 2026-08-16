CREATE TABLE "experience_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"experience_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"event_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"visitor_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" text,
	"referrer" text
);
--> statement-breakpoint
ALTER TABLE "experience_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "experience_events" ADD CONSTRAINT "experience_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_events" ADD CONSTRAINT "experience_events_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "experience_events_experience_type_occurred_at_idx" ON "experience_events" USING btree ("experience_id","event_type","occurred_at");--> statement-breakpoint
CREATE INDEX "experience_events_organization_id_idx" ON "experience_events" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "experience_events_visitor_id_idx" ON "experience_events" USING btree ("visitor_id");--> statement-breakpoint
CREATE POLICY "experience_events_select_member" ON "experience_events" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
    select 1 from "organization_members"
    where "organization_members"."organization_id" = "experience_events"."organization_id"
      and "organization_members"."user_id" = (select auth.uid())
  ));