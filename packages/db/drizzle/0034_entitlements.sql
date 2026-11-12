CREATE TABLE "core_entitlements" (
	"org_id" text PRIMARY KEY NOT NULL,
	"org_status" text DEFAULT 'active' NOT NULL,
	"plugins" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"lapsed" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL,
	"last_error" text,
	CONSTRAINT "core_entitlements_org_status_check" CHECK ("core_entitlements"."org_status" IN ('active', 'suspended', 'inactive'))
);
--> statement-breakpoint
ALTER TABLE "core_entitlements" ADD CONSTRAINT "core_entitlements_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE core_entitlements ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_entitlements FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_entitlements USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
