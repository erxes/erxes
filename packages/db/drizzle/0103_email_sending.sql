CREATE TABLE "core_broadcast_schedules" (
	"broadcast_id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"frequency" text NOT NULL,
	"interval" smallint DEFAULT 1 NOT NULL,
	"weekdays" smallint[] DEFAULT '{}'::smallint[] NOT NULL,
	"day_of_month" smallint,
	"at" text NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date,
	"max_runs" integer,
	"state" text DEFAULT 'draft' NOT NULL,
	"next_run_at" timestamp with time zone,
	"runs" integer DEFAULT 0 NOT NULL,
	"last_run_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_broadcast_schedules_frequency_check" CHECK ("core_broadcast_schedules"."frequency" IN ('day', 'week', 'month')),
	CONSTRAINT "core_broadcast_schedules_state_check" CHECK ("core_broadcast_schedules"."state" IN ('draft', 'active', 'paused', 'ended')),
	CONSTRAINT "core_broadcast_schedules_interval_check" CHECK ("core_broadcast_schedules"."interval" between 1 and 99),
	CONSTRAINT "core_broadcast_schedules_day_of_month_check" CHECK ("core_broadcast_schedules"."day_of_month" between 1 and 31),
	CONSTRAINT "core_broadcast_schedules_at_check" CHECK ("core_broadcast_schedules"."at" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
	CONSTRAINT "core_broadcast_schedules_max_runs_check" CHECK ("core_broadcast_schedules"."max_runs" > 0)
);
--> statement-breakpoint
CREATE TABLE "core_email_addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"email" text NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"last_sent_at" timestamp with time zone,
	"delivered_count" integer DEFAULT 0 NOT NULL,
	"last_delivered_at" timestamp with time zone,
	"soft_bounces" integer DEFAULT 0 NOT NULL,
	"last_bounced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_email_addresses_email_check" CHECK ("core_email_addresses"."email" = lower("core_email_addresses"."email"))
);
--> statement-breakpoint
CREATE TABLE "core_email_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"source" text NOT NULL,
	"source_id" text,
	"to" text NOT NULL,
	"customer_id" text,
	"subject" text NOT NULL,
	"status" text NOT NULL,
	"provider" text,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"error" text,
	"sent_at" timestamp with time zone,
	"reported_at" timestamp with time zone,
	"deferrals" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_email_deliveries_source_check" CHECK ("core_email_deliveries"."source" IN ('account', 'security', 'notification', 'customer', 'customer_account', 'broadcast', 'automation', 'plugin', 'ebarimt', 'settings')),
	CONSTRAINT "core_email_deliveries_status_check" CHECK ("core_email_deliveries"."status" IN ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed', 'suppressed', 'held', 'capped')),
	CONSTRAINT "core_email_deliveries_provider_check" CHECK ("core_email_deliveries"."provider" IN ('smtp', 'sendgrid', 'ses', 'log'))
);
--> statement-breakpoint
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
	"limit_notice_day" date,
	"events_notice_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_email_ramps_tier_check" CHECK ("core_email_ramps"."tier" >= 0 and "core_email_ramps"."tier" < 5)
);
--> statement-breakpoint
CREATE TABLE "core_email_reply_tos" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"email" text NOT NULL,
	"status" text NOT NULL,
	"secret_hash" text,
	"expires_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_email_reply_tos_status_check" CHECK ("core_email_reply_tos"."status" IN ('pending', 'verified'))
);
--> statement-breakpoint
ALTER TABLE "core_email_senders" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "core_email_senders" CASCADE;--> statement-breakpoint
ALTER TABLE "core_broadcasts" DROP CONSTRAINT "core_broadcasts_status_check";--> statement-breakpoint
ALTER TABLE "core_organizations" ADD COLUMN "timezone" text DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_files" ADD COLUMN "public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD COLUMN "content" jsonb;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD COLUMN "html" text;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD COLUMN "attachment_ids" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD COLUMN "parent_id" text;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD COLUMN "occurrence_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD COLUMN "events_key" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD COLUMN "configuration_set" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD COLUMN "events_topic_arn" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_broadcast_schedules" ADD CONSTRAINT "core_broadcast_schedules_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_broadcast_schedules" ADD CONSTRAINT "core_broadcast_schedules_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "public"."core_broadcasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_email_addresses" ADD CONSTRAINT "core_email_addresses_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_email_deliveries" ADD CONSTRAINT "core_email_deliveries_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_email_ramps" ADD CONSTRAINT "core_email_ramps_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_email_reply_tos" ADD CONSTRAINT "core_email_reply_tos_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_broadcast_schedules_due_idx" ON "core_broadcast_schedules" USING btree ("next_run_at") WHERE "core_broadcast_schedules"."state" = 'active';--> statement-breakpoint
CREATE UNIQUE INDEX "core_email_addresses_org_email_key" ON "core_email_addresses" USING btree ("org_id","email");--> statement-breakpoint
CREATE INDEX "core_email_deliveries_org_created_idx" ON "core_email_deliveries" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_email_deliveries_source_idx" ON "core_email_deliveries" USING btree ("org_id","source","source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_email_reply_tos_org_email_key" ON "core_email_reply_tos" USING btree ("org_id",lower("email"));--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD CONSTRAINT "core_broadcasts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."core_broadcasts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_broadcasts_occurrence_key" ON "core_broadcasts" USING btree ("parent_id","occurrence_at");--> statement-breakpoint
ALTER TABLE "core_broadcasts" DROP COLUMN "from_email";--> statement-breakpoint
ALTER TABLE "core_files" ADD CONSTRAINT "core_files_public_check" CHECK (not "core_files"."public" or "core_files"."content_type" IN ('image/png', 'image/jpeg', 'image/gif', 'image/webp'));--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD CONSTRAINT "core_broadcasts_status_check" CHECK ("core_broadcasts"."status" IN ('draft', 'scheduled', 'sending', 'paused', 'sent', 'cancelled', 'failed', 'recurring'));--> statement-breakpoint
ALTER TABLE core_broadcast_schedules ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_broadcast_schedules FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_broadcast_schedules USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_email_addresses ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_email_addresses FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_email_addresses USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_email_deliveries ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_email_deliveries FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_email_deliveries USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_email_ramps ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_email_ramps FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_email_ramps USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_email_reply_tos ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_email_reply_tos FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_email_reply_tos USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
-- Schedules run by the organisation's time zone, not one on each trigger. An organisation
-- keeps the zone its scheduled and date triggers used most, so they fire when they did; the
-- triggers lose theirs. A trigger without a zone ran in Asia/Ulaanbaatar, so it counts as that;
-- hourly ones ran on UTC's minute and count for none. A zone Postgres doesn't know becomes UTC,
-- and an organisation without such triggers keeps UTC. The migration owner is bound by forced
-- RLS until the rewrite is done.
ALTER TABLE core_organizations NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_automations NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_automation_versions NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
UPDATE core_organizations o SET timezone = used.zone
FROM (
  SELECT DISTINCT ON (org_id) org_id, zone
  FROM (
    SELECT a.org_id,
      CASE WHEN EXISTS (SELECT 1 FROM pg_timezone_names n WHERE n.name = t.zone)
        THEN t.zone ELSE 'UTC' END AS zone
    FROM core_automations a
    CROSS JOIN LATERAL (
      SELECT coalesce(a.definition->'trigger'->>'timezone', 'Asia/Ulaanbaatar') AS zone
    ) t
    WHERE a.definition->'trigger'->>'kind' = 'date'
      OR (a.definition->'trigger'->>'kind' = 'schedule'
        AND a.definition->'trigger'->>'every' IS DISTINCT FROM 'hour')
  ) triggers
  GROUP BY org_id, zone
  ORDER BY org_id, count(*) DESC, zone
) used
WHERE used.org_id = o.id;
--> statement-breakpoint
UPDATE core_automations SET definition = definition #- '{trigger,timezone}'
WHERE definition->'trigger' ? 'timezone';
--> statement-breakpoint
UPDATE core_automation_versions SET definition = definition #- '{trigger,timezone}'
WHERE definition->'trigger' ? 'timezone';
--> statement-breakpoint
ALTER TABLE core_organizations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_automations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_automation_versions FORCE ROW LEVEL SECURITY;
