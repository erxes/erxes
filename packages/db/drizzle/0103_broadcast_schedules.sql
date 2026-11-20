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
ALTER TABLE "core_broadcasts" DROP CONSTRAINT "core_broadcasts_status_check";--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD COLUMN "parent_id" text;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD COLUMN "occurrence_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_broadcast_schedules" ADD CONSTRAINT "core_broadcast_schedules_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_broadcast_schedules" ADD CONSTRAINT "core_broadcast_schedules_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "public"."core_broadcasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_broadcast_schedules_due_idx" ON "core_broadcast_schedules" USING btree ("next_run_at") WHERE "core_broadcast_schedules"."state" = 'active';--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD CONSTRAINT "core_broadcasts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."core_broadcasts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_broadcasts_occurrence_key" ON "core_broadcasts" USING btree ("parent_id","occurrence_at");--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD CONSTRAINT "core_broadcasts_status_check" CHECK ("core_broadcasts"."status" IN ('draft', 'scheduled', 'sending', 'paused', 'sent', 'cancelled', 'failed', 'recurring'));--> statement-breakpoint
ALTER TABLE core_broadcast_schedules ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_broadcast_schedules FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_broadcast_schedules USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));