CREATE TABLE "core_email_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"source" text NOT NULL,
	"source_id" text,
	"to" text NOT NULL,
	"subject" text NOT NULL,
	"status" text NOT NULL,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"error" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_email_deliveries_source_check" CHECK ("core_email_deliveries"."source" IN ('account', 'security', 'notification', 'customer', 'broadcast', 'automation', 'plugin', 'ebarimt', 'settings')),
	CONSTRAINT "core_email_deliveries_status_check" CHECK ("core_email_deliveries"."status" IN ('queued', 'sent', 'failed'))
);
--> statement-breakpoint
ALTER TABLE "core_email_deliveries" ADD CONSTRAINT "core_email_deliveries_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_email_deliveries_org_created_idx" ON "core_email_deliveries" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_email_deliveries_source_idx" ON "core_email_deliveries" USING btree ("org_id","source","source_id");--> statement-breakpoint
ALTER TABLE core_email_deliveries ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_email_deliveries FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_email_deliveries USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));