CREATE TABLE "core_email_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"name" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD COLUMN "from_email" text;--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD COLUMN "verified_domains" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD COLUMN "domains_checked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD COLUMN "domains_error" text;--> statement-breakpoint
ALTER TABLE "core_email_templates" ADD CONSTRAINT "core_email_templates_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_email_templates" ADD CONSTRAINT "core_email_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."core_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_email_templates_org_name_key" ON "core_email_templates" USING btree ("org_id",lower("name"));--> statement-breakpoint
CREATE INDEX "core_email_templates_org_created_idx" ON "core_email_templates" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE core_email_templates ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_email_templates FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_email_templates USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));