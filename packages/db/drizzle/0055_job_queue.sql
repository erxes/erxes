-- Background work moves to pg-boss, in the core_queue schema (runMigrations
-- installs it before this runs). The queues as modules/jobs/registry.ts
-- defines them at this migration, so the jobs moved below, and events
-- published before the API first starts, retry as they will afterwards; the
-- API brings the settings up to date when it starts. Dead letter queues come
-- first: a queue names its own. Every queue is `exclusive`: a job's
-- singleton_key is its dedupe key (or its own id), so one key is queued or
-- running at most once. The event consumers become one queue each.
SELECT core_queue.create_queue(name, options::jsonb)
FROM (VALUES
  ('webhook.deliver', '{"policy":"exclusive","notify":true,"retryLimit":9,"retryDelay":120,"retryBackoff":true,"retryDelayMax":28800,"expireInSeconds":60}'),
  ('automation.advance.dead', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":300,"expireInSeconds":120}'),
  ('automation.advance', '{"policy":"exclusive","notify":true,"retryLimit":4,"retryDelay":30,"retryBackoff":true,"retryDelayMax":3600,"expireInSeconds":120,"deadLetter":"automation.advance.dead"}'),
  ('automation.call.dead', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":300,"expireInSeconds":120}'),
  ('automation.call', '{"policy":"exclusive","notify":true,"retryLimit":4,"retryDelay":30,"retryBackoff":true,"retryDelayMax":3600,"expireInSeconds":120,"deadLetter":"automation.call.dead"}'),
  ('automation.fire', '{"policy":"exclusive","notify":true,"retryLimit":7,"retryDelay":30,"retryBackoff":true,"retryDelayMax":21600,"expireInSeconds":600}'),
  ('email.send', '{"policy":"exclusive","notify":true,"retryLimit":5,"retryDelay":30,"retryBackoff":true,"retryDelayMax":21600,"expireInSeconds":60}'),
  ('sms.send', '{"policy":"exclusive","notify":true,"retryLimit":3,"retryDelay":30,"retryBackoff":true,"retryDelayMax":21600,"expireInSeconds":60}'),
  ('payment.check', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":21600,"expireInSeconds":120}'),
  ('plugin.event', '{"policy":"exclusive","notify":true,"retryLimit":9,"retryDelay":120,"retryBackoff":true,"retryDelayMax":28800,"expireInSeconds":60}'),
  ('audit.stream', '{"policy":"exclusive","notify":true,"retryLimit":5,"retryDelay":20,"retryBackoff":true,"retryDelayMax":900,"expireInSeconds":300}'),
  ('import.parse.dead', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":300,"expireInSeconds":120}'),
  ('import.parse', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":21600,"expireInSeconds":300,"deadLetter":"import.parse.dead"}'),
  ('import.check.dead', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":300,"expireInSeconds":120}'),
  ('import.check', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":21600,"expireInSeconds":600,"deadLetter":"import.check.dead"}'),
  ('import.run.dead', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":300,"expireInSeconds":120}'),
  ('import.run', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":21600,"expireInSeconds":600,"deadLetter":"import.run.dead"}'),
  ('import.undo.dead', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":300,"expireInSeconds":120}'),
  ('import.undo', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":21600,"expireInSeconds":600,"deadLetter":"import.undo.dead"}'),
  ('export.run.dead', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":300,"expireInSeconds":120}'),
  ('export.run', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":21600,"expireInSeconds":900,"deadLetter":"export.run.dead"}'),
  ('organization.example_data', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":30,"retryBackoff":true,"retryDelayMax":21600,"expireInSeconds":900}'),
  ('event.core.timeline', '{"policy":"exclusive","notify":true,"retryLimit":9,"retryDelay":120,"retryBackoff":true,"retryDelayMax":43200,"expireInSeconds":120}'),
  ('event.core.notifications', '{"policy":"exclusive","notify":true,"retryLimit":9,"retryDelay":120,"retryBackoff":true,"retryDelayMax":43200,"expireInSeconds":120}'),
  ('event.core.webhooks', '{"policy":"exclusive","notify":true,"retryLimit":9,"retryDelay":120,"retryBackoff":true,"retryDelayMax":43200,"expireInSeconds":120}'),
  ('event.core.automations', '{"policy":"exclusive","notify":true,"retryLimit":9,"retryDelay":120,"retryBackoff":true,"retryDelayMax":43200,"expireInSeconds":120}'),
  ('event.core.plugins', '{"policy":"exclusive","notify":true,"retryLimit":9,"retryDelay":120,"retryBackoff":true,"retryDelayMax":43200,"expireInSeconds":120}')
) AS queues (name, options)
ORDER BY options::jsonb ? 'deadLetter';
--> statement-breakpoint
-- Nothing writes the old tables or publishes an event until this commits, so
-- every job and event moves exactly once (the new trigger takes over below).
-- Row level security off for the copies: they read every organisation's rows.
LOCK TABLE core_events, core_jobs, core_event_failures, core_event_consumers IN EXCLUSIVE MODE;
--> statement-breakpoint
ALTER TABLE "core_event_consumers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "core_event_failures" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "core_jobs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE core_events NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
-- Each job below takes its queue's settings, as send() does, and stays until
-- its queue's retention after it comes due. Waiting jobs move over with their
-- attempts left. A job that ran counts its attempts as pg-boss does: a fetch
-- adds one to retry_count once started_on is set, and retry() of a failed job
-- adds one to retry_limit, so a dead job retried by hand gets one attempt. A
-- job of a queue that no longer exists doesn't move. Audit stream rounds
-- don't either: the audit.streams schedule starts a round for every stream
-- with entries to send.
INSERT INTO core_queue.job (
  name, data, singleton_key, policy, retry_delay, retry_backoff, retry_delay_max, expire_seconds,
  deletion_seconds, dead_letter, state, start_after, keep_until, started_on, retry_count,
  retry_limit, output, completed_on
)
SELECT q.name, jsonb_build_object('orgId', j.org_id, 'payload', j.payload), coalesce(j.dedupe_key, j.id),
  q.policy, q.retry_delay, q.retry_backoff, q.retry_delay_max, q.expire_seconds, q.deletion_seconds,
  q.dead_letter,
  (CASE WHEN j.status = 'dead' THEN 'failed' ELSE 'created' END)::core_queue.job_state,
  j.run_at, greatest(j.run_at, now()) + make_interval(secs => q.retention_seconds),
  CASE WHEN j.status = 'dead' THEN j.updated_at END,
  CASE WHEN j.status = 'dead' THEN greatest(j.attempts - 1, 0) ELSE 0 END,
  CASE WHEN j.status = 'dead' THEN greatest(j.attempts - 1, 0)
    ELSE greatest(j.max_attempts - j.attempts - 1, 0) END,
  CASE WHEN j.last_error IS NULL THEN NULL ELSE jsonb_build_object('message', j.last_error) END,
  CASE WHEN j.status = 'dead' THEN j.updated_at END
FROM core_jobs j
JOIN core_queue.queue q ON q.name = j.queue
WHERE j.queue <> 'audit.stream'
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Events a consumer failed on keep their state; one still retrying gets at
-- least one attempt more.
INSERT INTO core_queue.job (
  name, data, singleton_key, policy, retry_delay, retry_backoff, retry_delay_max, expire_seconds,
  deletion_seconds, dead_letter, state, start_after, keep_until, started_on, retry_count,
  retry_limit, output, completed_on
)
SELECT q.name, jsonb_build_object('orgId', f.org_id, 'payload', jsonb_build_object('eventId', f.event_id)),
  f.event_id, q.policy, q.retry_delay, q.retry_backoff, q.retry_delay_max, q.expire_seconds,
  q.deletion_seconds, q.dead_letter,
  (CASE WHEN f.status = 'dead' THEN 'failed' ELSE 'retry' END)::core_queue.job_state,
  coalesce(f.next_attempt_at, now()),
  greatest(f.next_attempt_at, now()) + make_interval(secs => q.retention_seconds),
  f.updated_at, greatest(f.attempts - 1, 0),
  CASE WHEN f.status = 'dead' THEN greatest(f.attempts - 1, 0)
    ELSE greatest(f.attempts, q.retry_limit) END,
  jsonb_build_object('message', f.last_error), CASE WHEN f.status = 'dead' THEN f.updated_at END
FROM core_event_failures f
JOIN core_queue.queue q ON q.name = 'event.' || f.consumer
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Events past a consumer's read position become its jobs.
INSERT INTO core_queue.job (
  name, data, singleton_key, policy, retry_limit, retry_delay, retry_backoff, retry_delay_max,
  expire_seconds, deletion_seconds, dead_letter
)
SELECT q.name, jsonb_build_object('orgId', e.org_id, 'payload', jsonb_build_object('eventId', e.id)),
  e.id, q.policy, q.retry_limit, q.retry_delay, q.retry_backoff, q.retry_delay_max,
  q.expire_seconds, q.deletion_seconds, q.dead_letter
FROM core_event_consumers c
JOIN core_queue.queue q ON q.name = 'event.' || c.name
JOIN core_events e ON (e.tx_id, e.seq) > (c.last_tx_id, c.last_seq)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
ALTER TABLE core_events FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
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
