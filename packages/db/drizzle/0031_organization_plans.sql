CREATE TABLE "core_organization_plans" (
	"org_id" text PRIMARY KEY NOT NULL,
	"plan" text NOT NULL,
	"plan_name" text,
	"status" text NOT NULL,
	"current_period_end" timestamp with time zone,
	"grace_until" timestamp with time zone,
	"suspended" boolean DEFAULT false NOT NULL,
	"suspended_reason" text,
	"plugins" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"limits" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"manage_url" text,
	"version" bigint NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_organization_plans_status_check" CHECK ("core_organization_plans"."status" IN ('trialing', 'active', 'past_due', 'canceled', 'expired'))
);
--> statement-breakpoint
ALTER TABLE "core_organization_plans" ADD CONSTRAINT "core_organization_plans_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE core_organization_plans ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_organization_plans FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_organization_plans USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
