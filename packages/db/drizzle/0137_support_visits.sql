CREATE TABLE "core_support_visits" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"staff_id" text NOT NULL,
	"staff_name" text NOT NULL,
	"staff_email" text NOT NULL,
	"user_id" text NOT NULL,
	"reason" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"ended_by" text
);
--> statement-breakpoint
ALTER TABLE "core_support_visits" ADD CONSTRAINT "core_support_visits_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_support_visits" ADD CONSTRAINT "core_support_visits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."core_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_support_visits" ADD CONSTRAINT "core_support_visits_ended_by_fkey" FOREIGN KEY ("ended_by") REFERENCES "public"."core_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_support_visits_org_started_idx" ON "core_support_visits" USING btree ("org_id","started_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_support_visits_org_user_idx" ON "core_support_visits" USING btree ("org_id","user_id");--> statement-breakpoint
CREATE INDEX "core_support_visits_org_staff_idx" ON "core_support_visits" USING btree ("org_id","staff_id");--> statement-breakpoint
ALTER TABLE core_support_visits ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_support_visits FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_support_visits USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));