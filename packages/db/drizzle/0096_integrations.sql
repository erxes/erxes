CREATE TABLE "core_integration_program_versions" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"program_id" text NOT NULL,
	"version" integer NOT NULL,
	"definition" jsonb NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_integration_program_versions_pkey" PRIMARY KEY("program_id","version")
);
--> statement-breakpoint
CREATE TABLE "core_integration_programs" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"integration_id" text NOT NULL,
	"kind" text NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"outputs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"events" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"code" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_integration_programs_kind_check" CHECK ("core_integration_programs"."kind" IN ('action', 'incoming'))
);
--> statement-breakpoint
CREATE TABLE "core_integrations" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"hosts" text[] NOT NULL,
	"secrets_sealed" text,
	"sealed_names" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_integration_program_versions" ADD CONSTRAINT "core_integration_program_versions_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."core_integration_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_integration_program_versions" ADD CONSTRAINT "core_integration_program_versions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_integration_programs" ADD CONSTRAINT "core_integration_programs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "public"."core_integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_integration_programs" ADD CONSTRAINT "core_integration_programs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_integrations" ADD CONSTRAINT "core_integrations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_integration_programs_org_integration_kind_key_key" ON "core_integration_programs" USING btree ("org_id","integration_id","kind","key");--> statement-breakpoint
CREATE UNIQUE INDEX "core_integrations_org_key_key" ON "core_integrations" USING btree ("org_id","key");--> statement-breakpoint
ALTER TABLE core_integrations ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_integrations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_integrations USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_integration_programs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_integration_programs FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_integration_programs USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_integration_program_versions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_integration_program_versions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_integration_program_versions USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));