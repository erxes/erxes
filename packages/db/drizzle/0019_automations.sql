CREATE TABLE "core_automation_run_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"run_id" text NOT NULL,
	"step_id" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"error" text,
	"attempt" integer DEFAULT 1 NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_automation_run_steps_status_check" CHECK ("core_automation_run_steps"."status" IN ('succeeded', 'failed', 'skipped'))
);
--> statement-breakpoint
CREATE TABLE "core_automation_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"automation_id" text NOT NULL,
	"version" integer NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"subject_type" text,
	"subject_id" text,
	"status" text DEFAULT 'running' NOT NULL,
	"cursor" jsonb DEFAULT '[0]'::jsonb NOT NULL,
	"context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"depth" integer DEFAULT 0 NOT NULL,
	"error" text,
	"waiting_until" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_automation_runs_status_check" CHECK ("core_automation_runs"."status" IN ('running', 'waiting', 'succeeded', 'failed', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "core_automation_versions" (
	"org_id" text NOT NULL,
	"automation_id" text NOT NULL,
	"version" integer NOT NULL,
	"definition" jsonb NOT NULL,
	"published_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_automation_versions_pkey" PRIMARY KEY("automation_id","version")
);
--> statement-breakpoint
CREATE TABLE "core_automations" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"definition" jsonb NOT NULL,
	"trigger_event" text NOT NULL,
	"active_version" integer,
	"activated_by" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_automations_status_check" CHECK ("core_automations"."status" IN ('draft', 'active', 'paused'))
);
--> statement-breakpoint
ALTER TABLE "core_events" ADD COLUMN "caused_by_run" text;--> statement-breakpoint
ALTER TABLE "core_events" ADD COLUMN "depth" integer DEFAULT 0 NOT NULL;--> statement-breakpointCREATE UNIQUE INDEX "core_automation_runs_org_id_id_key" ON "core_automation_runs" USING btree ("org_id","id");
--> statement-breakpointCREATE UNIQUE INDEX "core_automations_org_id_id_key" ON "core_automations" USING btree ("org_id","id");
--> statement-breakpoint
ALTER TABLE "core_automation_run_steps" ADD CONSTRAINT "core_automation_run_steps_run_fkey" FOREIGN KEY ("org_id","run_id") REFERENCES "public"."core_automation_runs"("org_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_automation_runs" ADD CONSTRAINT "core_automation_runs_automation_fkey" FOREIGN KEY ("org_id","automation_id") REFERENCES "public"."core_automations"("org_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_automation_versions" ADD CONSTRAINT "core_automation_versions_automation_fkey" FOREIGN KEY ("org_id","automation_id") REFERENCES "public"."core_automations"("org_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_automations" ADD CONSTRAINT "core_automations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_automation_run_steps_run_idx" ON "core_automation_run_steps" USING btree ("run_id","finished_at");--> statement-breakpoint
CREATE UNIQUE INDEX "core_automation_runs_event_key" ON "core_automation_runs" USING btree ("automation_id","event_id");--> statement-breakpoint
CREATE INDEX "core_automation_runs_automation_idx" ON "core_automation_runs" USING btree ("org_id","automation_id","started_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_automation_runs_subject_idx" ON "core_automation_runs" USING btree ("automation_id","subject_id","started_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_automations_trigger_idx" ON "core_automations" USING btree ("org_id","trigger_event") WHERE "core_automations"."status" = 'active';--> statement-breakpoint
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['core_automations', 'core_automation_versions', 'core_automation_runs', 'core_automation_run_steps'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY core_tenant ON %I USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id))', t);
  END LOOP;
END $$;
