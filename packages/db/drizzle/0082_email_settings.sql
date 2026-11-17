CREATE TABLE "core_email_settings" (
	"org_id" text PRIMARY KEY DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"provider" text NOT NULL,
	"from_name" text DEFAULT '' NOT NULL,
	"from_email" text NOT NULL,
	"smtp_host" text DEFAULT '' NOT NULL,
	"smtp_port" integer DEFAULT 587 NOT NULL,
	"smtp_secure" boolean DEFAULT false NOT NULL,
	"username" text DEFAULT '' NOT NULL,
	"region" text DEFAULT '' NOT NULL,
	"secret_sealed" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_email_settings_provider_check" CHECK ("core_email_settings"."provider" IN ('smtp', 'sendgrid', 'ses'))
);
--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD CONSTRAINT "core_email_settings_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE core_email_settings ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_email_settings FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_email_settings USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
