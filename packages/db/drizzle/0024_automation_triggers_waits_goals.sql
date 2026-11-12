ALTER TABLE "core_automation_runs" ADD COLUMN "wait_event" text;--> statement-breakpoint
ALTER TABLE "core_automation_runs" ADD COLUMN "goal_reached_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_automations" ADD COLUMN "next_run_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_automations" ADD COLUMN "state" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "core_automation_runs_waiting_idx" ON "core_automation_runs" USING btree ("org_id","subject_id") WHERE "core_automation_runs"."status" = 'waiting';--> statement-breakpoint
CREATE INDEX "core_automations_due_idx" ON "core_automations" USING btree ("next_run_at") WHERE "core_automations"."status" = 'active';