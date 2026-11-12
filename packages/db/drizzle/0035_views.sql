CREATE TABLE "core_views" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"record_type" text NOT NULL,
	"name" text NOT NULL,
	"filter" jsonb,
	"search" text,
	"columns" jsonb,
	"sort" jsonb,
	"shared" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_views_record_type_check" CHECK ("core_views"."record_type" IN ('customer', 'lead', 'company'))
);
--> statement-breakpoint
ALTER TABLE "core_views" ADD CONSTRAINT "core_views_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_views_org_type_idx" ON "core_views" USING btree ("org_id","record_type");--> statement-breakpoint
ALTER TABLE core_views ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_views FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_views USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
