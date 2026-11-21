CREATE OR REPLACE FUNCTION core_live_topic(p_org_id text, p_topic text, p_user_ids text[] DEFAULT NULL)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  total int := coalesce(array_length(p_user_ids, 1), 0);
  i int := 1;
BEGIN
  IF total = 0 THEN
    PERFORM pg_notify('core_live', json_build_object('o', p_org_id, 'k', 'topic', 't', p_topic)::text);
    RETURN;
  END IF;
  WHILE i <= total LOOP
    PERFORM pg_notify('core_live', json_build_object('o', p_org_id, 'k', 'topic', 't', p_topic, 'u', p_user_ids[i:i + 99])::text);
    i := i + 100;
  END LOOP;
END $$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION core_live_topic(text, text, text[]) FROM PUBLIC;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_live_signal(p_org_id text, p_plugin text, p_topic text, p_user_ids text[] DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF p_plugin !~ '^[a-z][a-z0-9_]{0,39}$' OR p_topic !~ '^[a-z0-9][a-z0-9._:-]{0,99}$' THEN
    RAISE EXCEPTION 'core_live_signal: invalid plugin or topic';
  END IF;
  PERFORM core_enter_org(p_org_id, p_plugin);
  PERFORM core_live_topic(p_org_id, 'plugin:' || p_plugin || ':' || p_topic, p_user_ids);
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_live_rows() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM core_live_topic(s.org_id, s.topic) FROM (
      SELECT DISTINCT r.org_id, TG_ARGV[0] || coalesce(':' || (to_jsonb(r) ->> TG_ARGV[1]), '') AS topic
      FROM old_rows r) s;
  ELSE
    PERFORM core_live_topic(s.org_id, s.topic) FROM (
      SELECT DISTINCT r.org_id, TG_ARGV[0] || coalesce(':' || (to_jsonb(r) ->> TG_ARGV[1]), '') AS topic
      FROM new_rows r) s;
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_notifications_live() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM core_live_topic(s.org_id, 'inbox', s.users)
    FROM (SELECT org_id, array_agg(DISTINCT user_id) AS users FROM old_rows GROUP BY org_id) s;
  ELSE
    PERFORM core_live_topic(s.org_id, 'inbox', s.users)
    FROM (SELECT org_id, array_agg(DISTINCT user_id) AS users FROM new_rows GROUP BY org_id) s;
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_activities_live_send(p_org text, p_targets jsonb) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  IF jsonb_array_length(p_targets) > 50 THEN
    PERFORM pg_notify('core_live', json_build_object('o', p_org, 'k', 'resync')::text);
  ELSE
    PERFORM core_live_topic(p_org, 'timeline:' || (t->>'t') || ':' || (t->>'i'))
    FROM jsonb_array_elements(p_targets) t;
  END IF;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_assistant_threads_live() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  r core_assistant_threads%ROWTYPE := coalesce(NEW, OLD);
BEGIN
  PERFORM core_live_topic(r.org_id, 'assistant', ARRAY[r.user_id]);
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_automation_run_steps_live() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM core_live_topic(s.org_id, 'automations.runs:' || s.automation_id) FROM (
    SELECT DISTINCT runs.org_id, runs.automation_id
    FROM new_rows steps
    JOIN core_automation_runs runs ON runs.org_id = steps.org_id AND runs.id = steps.run_id) s;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_event_data_live AFTER INSERT ON core_event_data
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_live_rows('automations.catalog');
--> statement-breakpoint
CREATE TRIGGER core_automation_runs_live_insert AFTER INSERT ON core_automation_runs
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_live_rows('automations.runs', 'automation_id');
--> statement-breakpoint
CREATE TRIGGER core_automation_runs_live_update AFTER UPDATE ON core_automation_runs
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_live_rows('automations.runs', 'automation_id');
--> statement-breakpoint
CREATE TRIGGER core_automation_runs_live_delete AFTER DELETE ON core_automation_runs
  REFERENCING OLD TABLE AS old_rows FOR EACH STATEMENT EXECUTE FUNCTION core_live_rows('automations.runs', 'automation_id');
--> statement-breakpoint
CREATE TRIGGER core_automation_run_steps_live_insert AFTER INSERT ON core_automation_run_steps
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_automation_run_steps_live();
--> statement-breakpoint
CREATE TRIGGER core_automation_run_steps_live_update AFTER UPDATE ON core_automation_run_steps
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_automation_run_steps_live();
--> statement-breakpoint
CREATE TRIGGER core_webhook_deliveries_live_insert AFTER INSERT ON core_webhook_deliveries
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_live_rows('webhooks.deliveries', 'webhook_id');
--> statement-breakpoint
CREATE TRIGGER core_webhook_deliveries_live_update AFTER UPDATE ON core_webhook_deliveries
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_live_rows('webhooks.deliveries', 'webhook_id');
--> statement-breakpoint
CREATE TRIGGER core_broadcasts_live_update AFTER UPDATE ON core_broadcasts
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_live_rows('broadcasts', 'id');
--> statement-breakpoint
CREATE TRIGGER core_broadcast_recipients_live_insert AFTER INSERT ON core_broadcast_recipients
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_live_rows('broadcasts', 'broadcast_id');
--> statement-breakpoint
CREATE TRIGGER core_broadcast_recipients_live_update AFTER UPDATE ON core_broadcast_recipients
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_live_rows('broadcasts', 'broadcast_id');
