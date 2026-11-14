-- Background work moves to pg-boss, in the core_queue schema (runMigrations
-- installs it before this runs). Every queue is `exclusive`: a job's
-- singleton_key is its dedupe key (or its own id), so one key is queued or
-- running at most once. The event consumers become one queue each.
SELECT core_queue.create_queue(name, '{"policy": "exclusive", "notify": true}'::jsonb)
FROM (
  VALUES ('event.core.timeline'), ('event.core.notifications'), ('event.core.webhooks'),
    ('event.core.automations'), ('event.core.plugins')
  UNION
  SELECT DISTINCT queue FROM core_jobs WHERE queue <> 'audit.stream'
) AS queues (name);
--> statement-breakpoint
-- Waiting and dead jobs move over with their attempts left. Audit stream
-- rounds don't: the audit.streams schedule starts a round for every stream.
INSERT INTO core_queue.job (name, data, state, singleton_key, policy, start_after, retry_limit, output, completed_on)
SELECT j.queue, jsonb_build_object('orgId', j.org_id, 'payload', j.payload),
  (CASE WHEN j.status = 'dead' THEN 'failed' ELSE 'created' END)::core_queue.job_state,
  coalesce(j.dedupe_key, j.id), 'exclusive', j.run_at, greatest(j.max_attempts - j.attempts - 1, 0),
  CASE WHEN j.last_error IS NULL THEN NULL ELSE jsonb_build_object('message', j.last_error) END,
  CASE WHEN j.status = 'dead' THEN j.updated_at END
FROM core_jobs j
WHERE j.queue <> 'audit.stream'
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Events a consumer failed on keep their state; events past a consumer's
-- cursor become its jobs.
INSERT INTO core_queue.job (name, data, state, singleton_key, policy, start_after, retry_count, retry_limit, output, completed_on)
SELECT 'event.' || f.consumer,
  jsonb_build_object('orgId', f.org_id, 'payload', jsonb_build_object('eventId', f.event_id)),
  (CASE WHEN f.status = 'dead' THEN 'failed' ELSE 'retry' END)::core_queue.job_state,
  f.event_id, 'exclusive', coalesce(f.next_attempt_at, now()), f.attempts, greatest(f.attempts, 9),
  jsonb_build_object('message', f.last_error), CASE WHEN f.status = 'dead' THEN f.updated_at END
FROM core_event_failures f
WHERE f.consumer IN ('core.timeline', 'core.notifications', 'core.webhooks', 'core.automations', 'core.plugins')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO core_queue.job (name, data, singleton_key, policy, retry_limit)
SELECT 'event.' || c.name,
  jsonb_build_object('orgId', e.org_id, 'payload', jsonb_build_object('eventId', e.id)), e.id, 'exclusive', 9
FROM core_event_consumers c
JOIN core_events e ON (e.tx_id, e.seq) > (c.last_tx_id, c.last_seq)
WHERE c.name IN ('core.timeline', 'core.notifications', 'core.webhooks', 'core.automations', 'core.plugins')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
ALTER TABLE "core_event_consumers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "core_event_failures" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "core_jobs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "core_event_consumers" CASCADE;--> statement-breakpoint
DROP TABLE "core_event_failures" CASCADE;--> statement-breakpoint
DROP TABLE "core_jobs" CASCADE;--> statement-breakpoint
DROP INDEX "core_events_seq_key";--> statement-breakpoint
DROP INDEX "core_events_commit_order_idx";--> statement-breakpoint
ALTER TABLE "core_events" DROP COLUMN "seq";--> statement-breakpoint
ALTER TABLE "core_events" DROP COLUMN "tx_id";--> statement-breakpoint
ALTER TABLE "core_audit_streams" DROP COLUMN "chain_id";--> statement-breakpoint
ALTER TABLE "core_webhook_deliveries" DROP COLUMN "next_attempt_at";
--> statement-breakpoint
DROP FUNCTION core_jobs_notify();
--> statement-breakpoint
DROP TRIGGER core_events_notify ON core_events;
--> statement-breakpoint
DROP FUNCTION core_events_notify();
--> statement-breakpoint
-- Each new event becomes one job per consumer queue (`event.<consumer>`), in
-- the transaction that published it, whoever published it: core, or a plugin
-- through core_publish_event(). pg-boss supports writing its job table
-- directly; the columns send() fills from the queue's settings are filled
-- here the same way. Security definer: plugin roles get no rights on
-- core_queue, and the job's organisation is the event's own.
CREATE FUNCTION core_event_jobs() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  INSERT INTO core_queue.job (
    name, data, singleton_key, policy, retry_limit, retry_delay, retry_backoff, retry_delay_max,
    expire_seconds, deletion_seconds, keep_until, dead_letter, heartbeat_seconds
  )
  SELECT q.name, jsonb_build_object('orgId', e.org_id, 'payload', jsonb_build_object('eventId', e.id)),
    e.id, q.policy, q.retry_limit, q.retry_delay, q.retry_backoff, q.retry_delay_max,
    q.expire_seconds, q.deletion_seconds, now() + make_interval(secs => q.retention_seconds),
    q.dead_letter, q.heartbeat_seconds
  FROM inserted e
  CROSS JOIN core_queue.queue q
  WHERE q.name LIKE 'event.%'
  ON CONFLICT DO NOTHING;

  -- Wakes the workers, as send() does: pg-boss's channel for this schema.
  PERFORM pg_notify('pgboss_' || left(encode(sha224('core_queue'::bytea), 'hex'), 24), q.name)
  FROM core_queue.queue q
  WHERE q.name LIKE 'event.%' AND q.notify;

  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_event_jobs AFTER INSERT ON core_events
  REFERENCING NEW TABLE AS inserted
  FOR EACH STATEMENT EXECUTE FUNCTION core_event_jobs();
--> statement-breakpoint
-- The runtime role and erxes_core_system also work the queue.
CREATE OR REPLACE FUNCTION core_grant_data(p_role text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', p_role);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I', p_role);
  EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO %I', p_role);
  EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO %I', p_role);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', p_role);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO %I', p_role);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO %I', p_role);
  EXECUTE format('GRANT USAGE ON SCHEMA core_queue TO %I', p_role);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA core_queue TO %I', p_role);
  EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA core_queue TO %I', p_role);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA core_queue GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', p_role);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA core_queue GRANT EXECUTE ON FUNCTIONS TO %I', p_role);
END $$;
--> statement-breakpoint
SELECT core_grant_data('erxes_core_system');
