CREATE TABLE "core_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"queue" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 8 NOT NULL,
	"locked_until" timestamp with time zone,
	"last_error" text,
	"dedupe_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_jobs_status_check" CHECK ("core_jobs"."status" IN ('queued', 'running', 'dead'))
);
--> statement-breakpoint
ALTER TABLE "core_jobs" ADD CONSTRAINT "core_jobs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_jobs_due_idx" ON "core_jobs" USING btree ("run_at") WHERE "core_jobs"."status" = 'queued';--> statement-breakpoint
CREATE INDEX "core_jobs_stuck_idx" ON "core_jobs" USING btree ("locked_until") WHERE "core_jobs"."status" = 'running';--> statement-breakpoint
CREATE INDEX "core_jobs_org_idx" ON "core_jobs" USING btree ("org_id","queue","status");--> statement-breakpoint
CREATE UNIQUE INDEX "core_jobs_dedupe_key" ON "core_jobs" USING btree ("org_id","queue","dedupe_key") WHERE "core_jobs"."dedupe_key" IS NOT NULL;--> statement-breakpoint
ALTER TABLE core_jobs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_jobs FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_jobs USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
-- New jobs wake the worker at once (sent on commit).
CREATE OR REPLACE FUNCTION core_jobs_notify() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_notify('core_jobs', '');
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_jobs_notify AFTER INSERT ON core_jobs
  FOR EACH STATEMENT EXECUTE FUNCTION core_jobs_notify();
