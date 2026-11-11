CREATE TABLE "core_event_consumers" (
	"name" text PRIMARY KEY NOT NULL,
	"last_tx_id" "xid8" DEFAULT '0'::xid8 NOT NULL,
	"last_seq" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_events" (
	"id" text PRIMARY KEY NOT NULL,
	"seq" bigserial NOT NULL,
	"tx_id" "xid8" DEFAULT pg_current_xact_id() NOT NULL,
	"org_id" text NOT NULL,
	"source" text NOT NULL,
	"type" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"subject_type" text,
	"subject_id" text,
	"entity_type" text,
	"entity_id" text,
	"actor_type" text NOT NULL,
	"actor_id" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" text,
	"link" text,
	"notify" jsonb,
	"dedupe_key" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_activities" ADD COLUMN "pinned_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_activities" ADD COLUMN "edited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_audit_logs" ADD COLUMN "source" text DEFAULT 'core' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_audit_logs" ADD COLUMN "chain_seq" bigint;--> statement-breakpoint
ALTER TABLE "core_audit_logs" ADD COLUMN "prev_hash" text;--> statement-breakpoint
ALTER TABLE "core_audit_logs" ADD COLUMN "hash" text;--> statement-breakpoint
ALTER TABLE "core_events" ADD CONSTRAINT "core_events_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_events_seq_key" ON "core_events" USING btree ("seq");--> statement-breakpoint
CREATE INDEX "core_events_commit_order_idx" ON "core_events" USING btree ("tx_id","seq");--> statement-breakpoint
CREATE INDEX "core_events_org_created_idx" ON "core_events" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_events_subject_idx" ON "core_events" USING btree ("org_id","subject_type","subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_events_dedupe_key" ON "core_events" USING btree ("org_id","source","dedupe_key") WHERE "core_events"."dedupe_key" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_activities_pinned_idx" ON "core_activities" USING btree ("org_id","target_type","target_id") WHERE "core_activities"."pinned_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_audit_logs_org_source_idx" ON "core_audit_logs" USING btree ("org_id","source","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "core_audit_logs_chain_key" ON "core_audit_logs" USING btree ("org_id","chain_seq");--> statement-breakpoint
-- Tamper evidence: the hash of one audit entry, chained to the previous one of its organisation.
CREATE OR REPLACE FUNCTION core_audit_entry_hash(p_prev text, e core_audit_logs) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT encode(sha256(convert_to(concat_ws('|',
    coalesce(p_prev, ''), e.chain_seq::text, e.id, e.org_id, e.source, e.actor_type, coalesce(e.actor_id, ''),
    e.action, coalesce(e.target_type, ''), coalesce(e.target_id, ''), coalesce(e.target_label, ''),
    coalesce(e.changes::text, ''), coalesce(e.metadata::text, ''), coalesce(e.ip, ''), coalesce(e.user_agent, ''),
    to_char(e.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US')
  ), 'UTF8')), 'hex')
$$;
--> statement-breakpoint
-- Chain the entries written before this migration, per organisation, oldest first.
DO $$
DECLARE
  r core_audit_logs%ROWTYPE;
  current_org text := '';
  prev text;
  n bigint := 0;
BEGIN
  FOR r IN SELECT * FROM core_audit_logs ORDER BY org_id, created_at, id LOOP
    IF r.org_id <> current_org THEN
      current_org := r.org_id;
      prev := NULL;
      n := 0;
    END IF;
    n := n + 1;
    r.chain_seq := n;
    r.prev_hash := prev;
    prev := core_audit_entry_hash(prev, r);
    UPDATE core_audit_logs SET chain_seq = n, prev_hash = r.prev_hash, hash = prev WHERE id = r.id;
  END LOOP;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_audit_logs_chain() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  last_seq bigint;
  last_hash text;
BEGIN
  -- One writer per organisation at a time, so the chain has no forks.
  PERFORM pg_advisory_xact_lock(hashtext('core:audit:' || NEW.org_id));
  SELECT chain_seq, hash INTO last_seq, last_hash
    FROM core_audit_logs
    WHERE org_id = NEW.org_id AND chain_seq IS NOT NULL
    ORDER BY chain_seq DESC
    LIMIT 1;
  NEW.chain_seq := coalesce(last_seq, 0) + 1;
  NEW.prev_hash := last_hash;
  NEW.hash := core_audit_entry_hash(last_hash, NEW);
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_audit_logs_chain BEFORE INSERT ON core_audit_logs
  FOR EACH ROW EXECUTE FUNCTION core_audit_logs_chain();
--> statement-breakpoint
-- Append-only: no edits; deletes only by retention (core.audit_prune) or with the organisation.
CREATE OR REPLACE FUNCTION core_audit_logs_protect() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'core_audit_logs is append-only';
  END IF;
  IF current_setting('core.audit_prune', true) = 'on'
     OR NOT EXISTS (SELECT 1 FROM core_organizations WHERE id = OLD.org_id) THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'core_audit_logs is append-only: entries are removed only by retention';
END $$;
--> statement-breakpoint
CREATE TRIGGER core_audit_logs_append_only BEFORE UPDATE OR DELETE ON core_audit_logs
  FOR EACH ROW EXECUTE FUNCTION core_audit_logs_protect();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_audit_logs_no_truncate() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'core_audit_logs is append-only';
END $$;
--> statement-breakpoint
CREATE TRIGGER core_audit_logs_no_truncate BEFORE TRUNCATE ON core_audit_logs
  FOR EACH STATEMENT EXECUTE FUNCTION core_audit_logs_no_truncate();
--> statement-breakpoint
-- Plugins on this database publish events in their own transaction (outbox):
--   SELECT core_publish_event('<org id>', 'hr', 'hr.leave.approved', '{"leaveId":"…"}'::jsonb, …);
CREATE OR REPLACE FUNCTION core_publish_event(
  p_org_id text,
  p_source text,
  p_type text,
  p_payload jsonb DEFAULT '{}'::jsonb,
  p_subject_type text DEFAULT NULL,
  p_subject_id text DEFAULT NULL,
  p_summary text DEFAULT NULL,
  p_link text DEFAULT NULL,
  p_notify jsonb DEFAULT NULL,
  p_dedupe_key text DEFAULT NULL,
  p_actor_user_id text DEFAULT NULL,
  p_entity_type text DEFAULT NULL,
  p_entity_id text DEFAULT NULL,
  p_occurred_at timestamptz DEFAULT NULL
) RETURNS text
LANGUAGE plpgsql AS $$
DECLARE
  v_id text;
BEGIN
  IF p_type NOT LIKE p_source || '.%' THEN
    RAISE EXCEPTION 'core_publish_event: the type must start with "%."', p_source;
  END IF;
  IF p_subject_type IS NOT NULL AND p_subject_type NOT IN ('customer', 'company') THEN
    RAISE EXCEPTION 'core_publish_event: subject type must be customer or company';
  END IF;
  INSERT INTO core_events (
    id, org_id, source, type, payload, subject_type, subject_id, summary, link, notify, dedupe_key,
    actor_type, actor_id, entity_type, entity_id, occurred_at
  ) VALUES (
    replace(gen_random_uuid()::text, '-', ''), p_org_id, p_source, p_type, coalesce(p_payload, '{}'::jsonb),
    p_subject_type, p_subject_id, p_summary, p_link, p_notify, p_dedupe_key,
    CASE WHEN p_actor_user_id IS NULL THEN 'plugin' ELSE 'user' END, coalesce(p_actor_user_id, p_source),
    p_entity_type, p_entity_id, coalesce(p_occurred_at, now())
  )
  ON CONFLICT (org_id, source, dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;
--> statement-breakpoint
-- Plugins on this database write audit entries in their own transaction:
--   SELECT core_record_audit('<org id>', 'hr', 'hr.employee.deleted', '<user id>', 'employee', '<id>', 'Bat');
CREATE OR REPLACE FUNCTION core_record_audit(
  p_org_id text,
  p_source text,
  p_action text,
  p_actor_user_id text DEFAULT NULL,
  p_target_type text DEFAULT NULL,
  p_target_id text DEFAULT NULL,
  p_target_label text DEFAULT NULL,
  p_changes jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL,
  p_ip text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS text
LANGUAGE plpgsql AS $$
DECLARE
  v_id text := replace(gen_random_uuid()::text, '-', '');
BEGIN
  IF p_action NOT LIKE p_source || '.%' THEN
    RAISE EXCEPTION 'core_record_audit: the action must start with "%."', p_source;
  END IF;
  INSERT INTO core_audit_logs (
    id, org_id, source, actor_type, actor_id, action, target_type, target_id, target_label, changes, metadata, ip, user_agent
  ) VALUES (
    v_id, p_org_id, p_source, CASE WHEN p_actor_user_id IS NULL THEN 'plugin' ELSE 'user' END,
    coalesce(p_actor_user_id, p_source), p_action, p_target_type, p_target_id, p_target_label,
    p_changes, p_metadata, p_ip, p_user_agent
  );
  RETURN v_id;
END $$;
