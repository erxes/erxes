-- Plugin jobs (the manifest's `jobs`). A plugin queues one with
-- core_enqueue_job() in its own transaction; plugin.job POSTs it to the
-- plugin's API and retries with the manifest's policy, and plugin.cron fans a
-- job with a `cron` out to every organisation that has the plugin. The queues
-- as modules/plugins/pluginJobs.ts defines them, so a job queued before the
-- API first starts waits in the right queue.
SELECT core_queue.create_queue(name, options::jsonb)
FROM (VALUES
  ('plugin.job', '{"policy":"exclusive","notify":true,"retryLimit":7,"retryDelay":30,"retryBackoff":true,"retryDelayMax":21600,"expireInSeconds":60}'),
  ('plugin.cron', '{"policy":"exclusive","notify":true,"retryLimit":2,"retryDelay":60,"retryBackoff":true,"retryDelayMax":60,"expireInSeconds":120}')
) AS queues (name, options);
--> statement-breakpoint
-- One job of the plugin's `p_name` for the organisation, written as pg-boss's
-- send() writes it (core_event_jobs does the same), with the retry policy the
-- manifest declares for it, or the queue's. Its id, or NULL when a job with
-- this dedupe key is queued or running. Core's own: the cron fan-out calls it
-- for each organisation, plugins call core_enqueue_job().
CREATE FUNCTION core_plugin_job(
  p_plugin text,
  p_org_id text,
  p_name text,
  p_payload jsonb,
  p_run_at timestamptz,
  p_dedupe_key text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_job jsonb;
  v_id uuid;
BEGIN
  SELECT j INTO v_job
  FROM public.core_plugins p, jsonb_array_elements(coalesce(p.manifest->'jobs', '[]'::jsonb)) AS j
  WHERE p.name = p_plugin AND j->>'name' = p_name;
  IF v_job IS NULL THEN
    RAISE EXCEPTION 'core_enqueue_job: % declares no job "%" in its manifest', p_plugin, p_name;
  END IF;
  INSERT INTO core_queue.job (
    name, data, singleton_key, policy, start_after, keep_until, retry_limit, retry_delay,
    retry_backoff, retry_delay_max, expire_seconds, deletion_seconds, dead_letter, heartbeat_seconds
  )
  SELECT q.name,
    jsonb_build_object('orgId', p_org_id, 'payload', jsonb_build_object(
      'plugin', p_plugin, 'name', p_name, 'payload', coalesce(p_payload, '{}'::jsonb))),
    concat_ws(':', p_plugin, p_org_id, p_name, coalesce(p_dedupe_key, gen_random_uuid()::text)),
    q.policy, s.start_after, s.start_after + make_interval(secs => q.retention_seconds),
    coalesce((v_job->'retry'->>'attempts')::int - 1, q.retry_limit),
    coalesce((v_job->'retry'->>'delay')::int, q.retry_delay),
    q.retry_backoff,
    coalesce((v_job->'retry'->>'maxDelay')::int, q.retry_delay_max),
    q.expire_seconds, q.deletion_seconds, q.dead_letter, q.heartbeat_seconds
  FROM core_queue.queue q
  CROSS JOIN (SELECT greatest(coalesce(p_run_at, now()), now()) AS start_after) s
  WHERE q.name = 'plugin.job'
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_id;
  -- Wakes the workers, as send() does: pg-boss's channel for this schema.
  IF v_id IS NOT NULL THEN
    PERFORM pg_notify('pgboss_' || left(encode(sha224('core_queue'::bytea), 'hex'), 24), 'plugin.job');
  END IF;
  RETURN v_id;
END $$;
--> statement-breakpoint
-- A plugin queues one of its jobs for an organisation that has it installed,
-- in its own transaction, so the job exists only if that commits. Its
-- database role names the plugin. NULL when `p_dedupe_key` is taken.
--   SELECT core_enqueue_job('<org id>', 'mail.sync', '{"accountId":"…"}'::jsonb, now() + interval '5 minutes', 'account:…');
CREATE FUNCTION core_enqueue_job(
  p_org_id text,
  p_name text,
  p_payload jsonb DEFAULT '{}'::jsonb,
  p_run_at timestamptz DEFAULT NULL,
  p_dedupe_key text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_plugin text := core_plugin_caller();
BEGIN
  IF v_plugin IS NULL THEN
    RAISE EXCEPTION 'core_enqueue_job: only a plugin''s database role (erxes_plugin_<name>) queues plugin jobs';
  END IF;
  PERFORM core_enter_org(p_org_id, v_plugin);
  RETURN core_plugin_job(v_plugin, p_org_id, p_name, p_payload, p_run_at, p_dedupe_key);
END $$;
--> statement-breakpoint
-- Only roles granted it may call them: plugin roles core_enqueue_job, by
-- `pnpm db:plugin-role` (and below, for roles made before this migration).
REVOKE ALL ON FUNCTION core_plugin_job(text, text, text, jsonb, timestamptz, text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION core_enqueue_job(text, text, jsonb, timestamptz, text) FROM PUBLIC;
--> statement-breakpoint
DO $$
DECLARE
  r text;
BEGIN
  FOR r IN SELECT rolname FROM pg_roles WHERE rolname ~ '^erxes_plugin_[a-z_][a-z0-9_]*$' LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION core_enqueue_job TO %I', r);
  END LOOP;
END $$;
