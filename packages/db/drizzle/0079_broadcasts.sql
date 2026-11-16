CREATE TABLE "core_broadcast_recipients" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"broadcast_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"address" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"reason" text,
	"claim" text,
	"claimed_until" timestamp with time zone,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"sent_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"clicked_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_broadcast_recipients_status_check" CHECK ("core_broadcast_recipients"."status" IN ('queued', 'sending', 'sent', 'failed', 'skipped'))
);
--> statement-breakpoint
CREATE TABLE "core_broadcasts" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"name" text NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"view_id" text,
	"filter" jsonb,
	"subject" text,
	"preheader" text,
	"body" text DEFAULT '' NOT NULL,
	"from_name" text,
	"reply_to" text,
	"scheduled_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"error" text,
	"total" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_broadcasts_channel_check" CHECK ("core_broadcasts"."channel" IN ('email', 'sms')),
	CONSTRAINT "core_broadcasts_status_check" CHECK ("core_broadcasts"."status" IN ('draft', 'scheduled', 'sending', 'paused', 'sent', 'cancelled', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "core_suppressions" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"channel" text NOT NULL,
	"address" text NOT NULL,
	"reason" text NOT NULL,
	"detail" text,
	"broadcast_id" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_suppressions_channel_check" CHECK ("core_suppressions"."channel" IN ('email', 'sms')),
	CONSTRAINT "core_suppressions_reason_check" CHECK ("core_suppressions"."reason" IN ('unsubscribed', 'bounced', 'complained', 'manual'))
);
--> statement-breakpoint
ALTER TABLE "core_broadcast_recipients" ADD CONSTRAINT "core_broadcast_recipients_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_broadcast_recipients" ADD CONSTRAINT "core_broadcast_recipients_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "public"."core_broadcasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_broadcast_recipients" ADD CONSTRAINT "core_broadcast_recipients_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."core_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD CONSTRAINT "core_broadcasts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD CONSTRAINT "core_broadcasts_view_id_fkey" FOREIGN KEY ("view_id") REFERENCES "public"."core_views"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD CONSTRAINT "core_broadcasts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."core_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_suppressions" ADD CONSTRAINT "core_suppressions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_suppressions" ADD CONSTRAINT "core_suppressions_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "public"."core_broadcasts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_suppressions" ADD CONSTRAINT "core_suppressions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."core_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_broadcast_recipients_address_key" ON "core_broadcast_recipients" USING btree ("broadcast_id","address");--> statement-breakpoint
CREATE INDEX "core_broadcast_recipients_status_idx" ON "core_broadcast_recipients" USING btree ("broadcast_id","status","id");--> statement-breakpoint
CREATE INDEX "core_broadcast_recipients_customer_idx" ON "core_broadcast_recipients" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "core_broadcasts_org_created_idx" ON "core_broadcasts" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_broadcasts_sending_idx" ON "core_broadcasts" USING btree ("status") WHERE "core_broadcasts"."status" = 'sending';--> statement-breakpoint
CREATE UNIQUE INDEX "core_suppressions_address_key" ON "core_suppressions" USING btree ("org_id","channel","address");--> statement-breakpoint
CREATE INDEX "core_suppressions_org_created_idx" ON "core_suppressions" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE core_broadcasts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_broadcasts FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_broadcasts USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_broadcast_recipients ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_broadcast_recipients FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_broadcast_recipients USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_suppressions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_suppressions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_suppressions USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
