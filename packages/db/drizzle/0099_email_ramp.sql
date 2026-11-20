CREATE TABLE "core_email_ramps" (
	"org_id" text PRIMARY KEY DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"tier" smallint DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"day" date DEFAULT (now() at time zone 'utc')::date NOT NULL,
	"sent_today" integer DEFAULT 0 NOT NULL,
	"tier_changed_at" timestamp with time zone,
	"evaluated_at" timestamp with time zone,
	"halted_at" timestamp with time zone,
	"halt_reason" text,
	"resumed_at" timestamp with time zone,
	"resumed_by" text,
	"resume_reason" text,
	"capped_notice_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_email_ramps_tier_check" CHECK ("core_email_ramps"."tier" >= 0 and "core_email_ramps"."tier" < 5)
);
--> statement-breakpoint
ALTER TABLE "core_email_deliveries" DROP CONSTRAINT "core_email_deliveries_source_check";--> statement-breakpoint
ALTER TABLE "core_email_deliveries" DROP CONSTRAINT "core_email_deliveries_status_check";--> statement-breakpoint
ALTER TABLE "core_email_ramps" ADD CONSTRAINT "core_email_ramps_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_email_deliveries" ADD CONSTRAINT "core_email_deliveries_source_check" CHECK ("core_email_deliveries"."source" IN ('account', 'security', 'notification', 'customer', 'customer_account', 'broadcast', 'automation', 'plugin', 'ebarimt', 'settings'));--> statement-breakpoint
ALTER TABLE "core_email_deliveries" ADD CONSTRAINT "core_email_deliveries_status_check" CHECK ("core_email_deliveries"."status" IN ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed', 'suppressed', 'held', 'capped'));--> statement-breakpoint
ALTER TABLE core_email_ramps ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_email_ramps FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_email_ramps USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));