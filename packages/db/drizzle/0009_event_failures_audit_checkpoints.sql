CREATE TABLE "core_audit_checkpoints" (
	"org_id" text NOT NULL,
	"chain_seq" bigint NOT NULL,
	"hash" text NOT NULL,
	"key_id" text NOT NULL,
	"signature" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_audit_checkpoints_pkey" PRIMARY KEY("org_id","chain_seq")
);
--> statement-breakpoint
CREATE TABLE "core_event_failures" (
	"consumer" text NOT NULL,
	"event_id" text NOT NULL,
	"org_id" text NOT NULL,
	"status" text DEFAULT 'retrying' NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"last_error" text NOT NULL,
	"next_attempt_at" timestamp with time zone,
	"first_failed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_event_failures_pkey" PRIMARY KEY("consumer","event_id")
);
--> statement-breakpoint
ALTER TABLE "core_audit_checkpoints" ADD CONSTRAINT "core_audit_checkpoints_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_event_failures" ADD CONSTRAINT "core_event_failures_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."core_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_event_failures" ADD CONSTRAINT "core_event_failures_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_event_failures_due_idx" ON "core_event_failures" USING btree ("next_attempt_at") WHERE "core_event_failures"."status" = 'retrying';--> statement-breakpoint
CREATE INDEX "core_event_failures_org_idx" ON "core_event_failures" USING btree ("org_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
-- Checkpoints are never edited; they go only with their organisation.
CREATE OR REPLACE FUNCTION core_audit_checkpoints_protect() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' AND NOT EXISTS (SELECT 1 FROM core_organizations WHERE id = OLD.org_id) THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'core_audit_checkpoints is append-only';
END $$;
--> statement-breakpoint
CREATE TRIGGER core_audit_checkpoints_append_only BEFORE UPDATE OR DELETE ON core_audit_checkpoints
  FOR EACH ROW EXECUTE FUNCTION core_audit_checkpoints_protect();
--> statement-breakpoint
CREATE TRIGGER core_audit_checkpoints_no_truncate BEFORE TRUNCATE ON core_audit_checkpoints
  FOR EACH STATEMENT EXECUTE FUNCTION core_audit_logs_no_truncate();
--> statement-breakpoint
-- Live signals once per statement instead of once per row: a bulk change
-- (merge, import) sends each distinct signal once, and more than 50 changed
-- timelines become one organisation-wide `resync`.
DROP TRIGGER IF EXISTS core_notifications_live ON core_notifications;
--> statement-breakpoint
DROP TRIGGER IF EXISTS core_activities_live ON core_activities;
--> statement-breakpoint
DROP FUNCTION IF EXISTS core_notifications_live();
--> statement-breakpoint
DROP FUNCTION IF EXISTS core_activities_live();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_notifications_live() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM pg_notify('core_live', s.payload)
    FROM (SELECT DISTINCT json_build_object('o', org_id, 'k', 'inbox', 'u', user_id)::text AS payload FROM old_rows) s;
  ELSE
    PERFORM pg_notify('core_live', s.payload)
    FROM (SELECT DISTINCT json_build_object('o', org_id, 'k', 'inbox', 'u', user_id)::text AS payload FROM new_rows) s;
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_notifications_live_insert AFTER INSERT ON core_notifications
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_notifications_live();
--> statement-breakpoint
CREATE TRIGGER core_notifications_live_update AFTER UPDATE ON core_notifications
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_notifications_live();
--> statement-breakpoint
CREATE TRIGGER core_notifications_live_delete AFTER DELETE ON core_notifications
  REFERENCING OLD TABLE AS old_rows FOR EACH STATEMENT EXECUTE FUNCTION core_notifications_live();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_activities_live_send(p_org text, p_targets jsonb) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  IF jsonb_array_length(p_targets) > 50 THEN
    PERFORM pg_notify('core_live', json_build_object('o', p_org, 'k', 'resync')::text);
  ELSE
    PERFORM pg_notify('core_live', json_build_object('o', p_org, 'k', 'timeline', 't', t->>'t', 'i', t->>'i')::text)
    FROM jsonb_array_elements(p_targets) t;
  END IF;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_activities_live() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM core_activities_live_send(c.org_id, c.targets) FROM (
      SELECT org_id, jsonb_agg(DISTINCT jsonb_build_object('t', target_type, 'i', target_id)) AS targets
      FROM new_rows GROUP BY org_id) c;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM core_activities_live_send(c.org_id, c.targets) FROM (
      SELECT org_id, jsonb_agg(DISTINCT jsonb_build_object('t', target_type, 'i', target_id)) AS targets
      FROM old_rows GROUP BY org_id) c;
  ELSE
    PERFORM core_activities_live_send(c.org_id, c.targets) FROM (
      SELECT org_id, jsonb_agg(DISTINCT jsonb_build_object('t', target_type, 'i', target_id)) AS targets
      FROM (SELECT org_id, target_type, target_id FROM new_rows
            UNION SELECT org_id, target_type, target_id FROM old_rows) changed
      GROUP BY org_id) c;
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_activities_live_insert AFTER INSERT ON core_activities
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_activities_live();
--> statement-breakpoint
CREATE TRIGGER core_activities_live_update AFTER UPDATE ON core_activities
  REFERENCING OLD TABLE AS old_rows NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_activities_live();
--> statement-breakpoint
CREATE TRIGGER core_activities_live_delete AFTER DELETE ON core_activities
  REFERENCING OLD TABLE AS old_rows FOR EACH STATEMENT EXECUTE FUNCTION core_activities_live();
