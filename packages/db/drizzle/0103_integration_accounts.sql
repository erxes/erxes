CREATE TABLE "core_integration_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"integration" text NOT NULL,
	"kind" text NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"detail" text,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"secret_sealed" text NOT NULL,
	"sealed_names" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" text DEFAULT 'healthy' NOT NULL,
	"error" text,
	"checked_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_integration_accounts_status_check" CHECK ("core_integration_accounts"."status" IN ('healthy', 'broken'))
);
--> statement-breakpoint
CREATE TABLE "core_integration_picks" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"integration" text NOT NULL,
	"user_id" text NOT NULL,
	"candidates_sealed" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_integration_setups" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"integration" text NOT NULL,
	"values" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"secret_sealed" text,
	"sealed_names" text[] DEFAULT '{}'::text[] NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_integration_setups_pkey" PRIMARY KEY("org_id","integration")
);
--> statement-breakpoint
ALTER TABLE "core_integration_accounts" ADD CONSTRAINT "core_integration_accounts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_integration_picks" ADD CONSTRAINT "core_integration_picks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_integration_setups" ADD CONSTRAINT "core_integration_setups_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_integration_accounts_org_integration_kind_external_key" ON "core_integration_accounts" USING btree ("org_id","integration","kind","external_id");--> statement-breakpoint
ALTER TABLE core_integration_accounts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_integration_accounts FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_integration_accounts USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_integration_picks ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_integration_picks FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_integration_picks USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_integration_setups ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_integration_setups FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_integration_setups USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));