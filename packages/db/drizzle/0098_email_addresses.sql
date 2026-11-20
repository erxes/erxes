CREATE TABLE "core_email_addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"email" text NOT NULL,
	"delivered_count" integer DEFAULT 0 NOT NULL,
	"last_delivered_at" timestamp with time zone,
	"soft_bounces" integer DEFAULT 0 NOT NULL,
	"last_bounced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_email_addresses_email_check" CHECK ("core_email_addresses"."email" = lower("core_email_addresses"."email"))
);
--> statement-breakpoint
ALTER TABLE "core_email_deliveries" DROP CONSTRAINT "core_email_deliveries_status_check";--> statement-breakpoint
ALTER TABLE "core_email_addresses" ADD CONSTRAINT "core_email_addresses_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_email_addresses_org_email_key" ON "core_email_addresses" USING btree ("org_id","email");--> statement-breakpoint
ALTER TABLE "core_email_deliveries" ADD CONSTRAINT "core_email_deliveries_status_check" CHECK ("core_email_deliveries"."status" IN ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed', 'suppressed'));--> statement-breakpoint
ALTER TABLE core_email_addresses ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_email_addresses FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_email_addresses USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));