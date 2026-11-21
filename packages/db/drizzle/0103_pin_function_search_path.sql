-- Plugin roles may create objects in public, so a function there could win name lookup over a
-- built-in (a closer argument match) inside core's own functions and core's queries. Two fixes:
-- each plpgsql function below runs with search_path = pg_catalog, pg_temp and names core's
-- objects in full (the SQL functions row level security calls take no SET, which would stop
-- Postgres inlining them into every query; they name every function in full instead), and an
-- event trigger refuses functions, operators and the like a plugin role puts in public. Plugins
-- keep creating their tables, views and indexes there.
CREATE OR REPLACE FUNCTION core_guard_plugin_ddl() RETURNS event_trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_plugin text := public.core_plugin_caller();
  r record;
BEGIN
  IF v_plugin IS NULL THEN
    RETURN;
  END IF;
  FOR r IN SELECT * FROM pg_event_trigger_ddl_commands() LOOP
    IF r.schema_name = 'public' AND r.object_type IN (
      'function', 'procedure', 'aggregate', 'operator', 'operator class', 'operator family',
      'conversion', 'collation', 'text search configuration', 'text search dictionary',
      'text search parser', 'text search template'
    ) THEN
      RAISE EXCEPTION 'plugin %: % % can''t go in schema public, where core looks up its functions',
        v_plugin, r.object_type, r.object_identity;
    END IF;
  END LOOP;
END $$;
--> statement-breakpoint
-- Only a superuser makes event triggers: a database migrated by another role keeps the gap,
-- and says so.
DO $$
BEGIN
  IF (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) THEN
    DROP EVENT TRIGGER IF EXISTS core_guard_plugin_ddl;
    CREATE EVENT TRIGGER core_guard_plugin_ddl ON ddl_command_end
      EXECUTE FUNCTION public.core_guard_plugin_ddl();
  ELSE
    RAISE WARNING 'core_guard_plugin_ddl: % is not a superuser, so plugin roles can still create functions in public. Run this migration as a superuser.', current_user;
  END IF;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_tenant_visible(p_org_id text) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT p_org_id = pg_catalog.current_setting('app.org_id', true)
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_key_list(name text) RETURNS text[]
LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN coalesce(pg_catalog.current_setting(name, true), '') = '' THEN NULL
    ELSE pg_catalog.string_to_array(pg_catalog.current_setting(name, true), ',') END
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_key_owner_visible(owner text) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT public.core_key_list('app.key_owners') IS NULL
    OR coalesce(owner = ANY (public.core_key_list('app.key_owners')), false)
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_join_text(p text[]) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$ SELECT coalesce(pg_catalog.array_to_string(p, ' '), '') $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_plugin_caller() RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT pg_catalog.substring(
    coalesce(nullif(pg_catalog.current_setting('role', true), 'none'), session_user::text),
    '^erxes_plugin_([a-z][a-z0-9_]*)$')
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_audit_entry_hash(p_prev text, e public.core_audit_logs) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(pg_catalog.concat_ws('|',
    coalesce(p_prev, ''), e.chain_seq::text, e.id, e.org_id, e.source, e.actor_type, coalesce(e.actor_id, ''),
    e.action, coalesce(e.target_type, ''), coalesce(e.target_id, ''), coalesce(e.target_label, ''),
    coalesce(e.changes::text, ''), coalesce(e.metadata::text, ''), coalesce(e.ip, ''), coalesce(e.user_agent, ''),
    pg_catalog.to_char(e.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US')
  ), 'UTF8')), 'hex')
$$;
--> statement-breakpoint
-- Policies it reads deparse with public. in front of core_tenant_visible under this path.
CREATE OR REPLACE FUNCTION core_plugin_tenancy_problems(p_plugin text DEFAULT NULL) RETURNS SETOF text
LANGUAGE sql STABLE SET search_path = pg_catalog, pg_temp AS $$
  WITH plugin_tables AS (
    SELECT c.oid, c.relname, c.relrowsecurity, c.relforcerowsecurity,
      substring(r.rolname from '^erxes_plugin_([a-z_][a-z0-9_]*)$') AS plugin
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles r ON r.oid = c.relowner
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'f')
      AND r.rolname ~ '^erxes_plugin_[a-z_][a-z0-9_]*$'
  ),
  checked AS (
    SELECT t.*,
      EXISTS (
        SELECT 1 FROM pg_policies p
        WHERE p.schemaname = 'public' AND p.tablename = t.relname AND p.policyname = 'tenant'
          AND p.permissive = 'PERMISSIVE' AND p.cmd = 'ALL'
          AND p.qual ~ '^public\.core_tenant_visible\([a-z_][a-z0-9_]*\)$' AND p.with_check = p.qual
      ) AS has_tenant_policy
    FROM plugin_tables t
    WHERE (p_plugin IS NULL OR t.plugin = p_plugin)
      AND t.relname <> ('__drizzle_migrations_' || t.plugin)
  )
  SELECT format('%s: %s', relname, concat_ws(', ',
    CASE WHEN left(relname, length(plugin) + 1) <> plugin || '_'
      THEN format('owned by plugin %s, so its name must start with %s_', plugin, plugin) END,
    CASE WHEN NOT relrowsecurity THEN 'row level security is off' END,
    CASE WHEN NOT relforcerowsecurity THEN 'row level security is not forced' END,
    CASE WHEN NOT has_tenant_policy THEN 'no tenant policy: run SELECT core_enable_tenant_rls(''' || relname || ''')' END))
  FROM checked
  WHERE left(relname, length(plugin) + 1) <> plugin || '_'
    OR NOT (relrowsecurity AND relforcerowsecurity AND has_tenant_policy)
  UNION ALL
  SELECT format('%s: permissive policy %s is not the tenant check, so it lets more rows through', c.relname, p.policyname)
  FROM checked c
  JOIN pg_policies p ON p.schemaname = 'public' AND p.tablename = c.relname
  WHERE p.permissive = 'PERMISSIVE' AND p.policyname <> 'tenant'
  ORDER BY 1
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_enable_tenant_rls(p_table regclass, p_column text DEFAULT 'org_id') RETURNS void
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF p_column !~ '^[a-z_][a-z0-9_]*$' THEN
    RAISE EXCEPTION 'core_enable_tenant_rls: invalid column %', p_column;
  END IF;
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', p_table);
  EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', p_table);
  EXECUTE format('DROP POLICY IF EXISTS tenant ON %s', p_table);
  EXECUTE format('CREATE POLICY tenant ON %s USING (public.core_tenant_visible(%I)) WITH CHECK (public.core_tenant_visible(%I))', p_table, p_column, p_column);
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_enter_org(p_org_id text, p_plugin text) RETURNS void
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_current text := nullif(current_setting('app.org_id', true), '');
  v_caller text := public.core_plugin_caller();
BEGIN
  IF v_caller IS NOT NULL AND v_caller <> p_plugin THEN
    RAISE EXCEPTION 'this database role is plugin %, not %', v_caller, p_plugin;
  END IF;
  IF coalesce(current_setting('app.system', true), '') <> 'on' THEN
    IF v_current IS NULL THEN
      PERFORM set_config('app.org_id', p_org_id, true);
    ELSIF v_current <> p_org_id THEN
      RAISE EXCEPTION 'this transaction works for organisation %, not %', v_current, p_org_id;
    END IF;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.core_plugin_installations i JOIN public.core_plugins p ON p.name = i.plugin
    WHERE i.org_id = p_org_id AND i.plugin = p_plugin AND i.status = 'active' AND p.status = 'active'
  ) THEN
    RAISE EXCEPTION '% is not installed in organisation %', p_plugin, p_org_id;
  END IF;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_enqueue_job(
  p_org_id text,
  p_name text,
  p_payload jsonb DEFAULT '{}'::jsonb,
  p_run_at timestamptz DEFAULT NULL,
  p_dedupe_key text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_plugin text := public.core_plugin_caller();
BEGIN
  IF v_plugin IS NULL THEN
    RAISE EXCEPTION 'core_enqueue_job: only a plugin''s database role (erxes_plugin_<name>) queues plugin jobs';
  END IF;
  PERFORM public.core_enter_org(p_org_id, v_plugin);
  RETURN public.core_plugin_job(v_plugin, p_org_id, p_name, p_payload, p_run_at, p_dedupe_key);
END $$;
--> statement-breakpoint
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
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_id text;
BEGIN
  IF p_type NOT LIKE p_source || '.%' THEN
    RAISE EXCEPTION 'core_publish_event: the type must start with "%."', p_source;
  END IF;
  IF p_subject_type IS NOT NULL AND p_subject_type NOT IN ('customer', 'company') THEN
    RAISE EXCEPTION 'core_publish_event: subject type must be customer or company';
  END IF;
  PERFORM public.core_enter_org(p_org_id, p_source);
  INSERT INTO public.core_events (
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
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_id text := replace(gen_random_uuid()::text, '-', '');
  v_changes jsonb := NULL;
  v_other jsonb := '{}'::jsonb;
  v_metadata jsonb := p_metadata;
BEGIN
  IF p_action NOT LIKE p_source || '.%' THEN
    RAISE EXCEPTION 'core_record_audit: the action must start with "%."', p_source;
  END IF;

  IF p_changes IS NOT NULL AND jsonb_typeof(p_changes) = 'object' THEN
    SELECT
      jsonb_object_agg(key, value) FILTER (
        WHERE jsonb_typeof(value) = 'array' AND jsonb_array_length(value) = 2
      ),
      coalesce(jsonb_object_agg(key, value) FILTER (
        WHERE NOT (jsonb_typeof(value) = 'array' AND jsonb_array_length(value) = 2)
      ), '{}'::jsonb)
    INTO v_changes, v_other
    FROM jsonb_each(p_changes);
  ELSIF p_changes IS NOT NULL AND jsonb_typeof(p_changes) <> 'null' THEN
    v_other := jsonb_build_object('changes', p_changes);
  END IF;

  IF v_other <> '{}'::jsonb THEN
    v_metadata := v_other || CASE
      WHEN jsonb_typeof(p_metadata) = 'object' THEN p_metadata
      ELSE '{}'::jsonb
    END;
  END IF;

  PERFORM public.core_enter_org(p_org_id, p_source);
  INSERT INTO public.core_audit_logs (
    id, org_id, source, actor_type, actor_id, action, target_type, target_id, target_label, changes, metadata, ip, user_agent
  ) VALUES (
    v_id, p_org_id, p_source, CASE WHEN p_actor_user_id IS NULL THEN 'plugin' ELSE 'user' END,
    coalesce(p_actor_user_id, p_source), p_action, p_target_type, p_target_id, p_target_label,
    v_changes, v_metadata, p_ip, p_user_agent
  );
  RETURN v_id;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_live_signal(p_org_id text, p_plugin text, p_topic text, p_user_ids text[] DEFAULT NULL) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF p_plugin !~ '^[a-z][a-z0-9_]{0,39}$' OR p_topic !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$' THEN
    RAISE EXCEPTION 'core_live_signal: invalid plugin or topic';
  END IF;
  PERFORM public.core_enter_org(p_org_id, p_plugin);
  PERFORM public.core_live_topic(p_org_id, 'plugin:' || p_plugin || ':' || p_topic, p_user_ids);
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_live_topic(p_org_id text, p_topic text, p_user_ids text[] DEFAULT NULL) RETURNS void
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
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
CREATE OR REPLACE FUNCTION core_activities_live_send(p_org text, p_targets jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF jsonb_array_length(p_targets) > 50 THEN
    PERFORM pg_notify('core_live', json_build_object('o', p_org, 'k', 'resync')::text);
  ELSE
    PERFORM public.core_live_topic(p_org, 'timeline:' || (t->>'t') || ':' || (t->>'i'))
    FROM jsonb_array_elements(p_targets) t;
  END IF;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_activities_live() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.core_activities_live_send(c.org_id, c.targets) FROM (
      SELECT org_id, jsonb_agg(DISTINCT jsonb_build_object('t', target_type, 'i', target_id)) AS targets
      FROM new_rows GROUP BY org_id) c;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.core_activities_live_send(c.org_id, c.targets) FROM (
      SELECT org_id, jsonb_agg(DISTINCT jsonb_build_object('t', target_type, 'i', target_id)) AS targets
      FROM old_rows GROUP BY org_id) c;
  ELSE
    PERFORM public.core_activities_live_send(c.org_id, c.targets) FROM (
      SELECT org_id, jsonb_agg(DISTINCT jsonb_build_object('t', target_type, 'i', target_id)) AS targets
      FROM (SELECT org_id, target_type, target_id FROM new_rows
            UNION SELECT org_id, target_type, target_id FROM old_rows) changed
      GROUP BY org_id) c;
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_activity_parts_live() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  ids text[];
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT array_agg(coalesce(to_jsonb(r) ->> 'activity_id', to_jsonb(r) ->> 'id')) INTO ids FROM old_rows r;
  ELSE
    SELECT array_agg(coalesce(to_jsonb(r) ->> 'activity_id', to_jsonb(r) ->> 'id')) INTO ids FROM new_rows r;
  END IF;

  PERFORM public.core_activities_live_send(c.org_id, c.targets) FROM (
    SELECT org_id, jsonb_agg(DISTINCT jsonb_build_object('t', target_type, 'i', target_id)) AS targets
    FROM public.core_activities WHERE id = ANY (ids) GROUP BY org_id) c;

  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_activity_touch() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF NEW.target_type = 'customer' THEN
    UPDATE public.core_customers SET last_activity_at = NEW.created_at
    WHERE id = NEW.target_id AND org_id = NEW.org_id AND last_activity_at < NEW.created_at;
  ELSIF NEW.target_type = 'company' THEN
    UPDATE public.core_companies SET last_activity_at = NEW.created_at
    WHERE id = NEW.target_id AND org_id = NEW.org_id AND last_activity_at < NEW.created_at;
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_assistant_threads_live() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  r public.core_assistant_threads%ROWTYPE := coalesce(NEW, OLD);
BEGIN
  PERFORM public.core_live_topic(r.org_id, 'assistant', ARRAY[r.user_id]);
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_automation_run_steps_live() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  PERFORM public.core_live_topic(s.org_id, 'automations.runs:' || s.automation_id) FROM (
    SELECT DISTINCT runs.org_id, runs.automation_id
    FROM new_rows steps
    JOIN public.core_automation_runs runs ON runs.org_id = steps.org_id AND runs.id = steps.run_id) s;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_live_rows() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.core_live_topic(s.org_id, s.topic) FROM (
      SELECT DISTINCT r.org_id, TG_ARGV[0] || coalesce(':' || (to_jsonb(r) ->> TG_ARGV[1]), '') AS topic
      FROM old_rows r) s;
  ELSE
    PERFORM public.core_live_topic(s.org_id, s.topic) FROM (
      SELECT DISTINCT r.org_id, TG_ARGV[0] || coalesce(':' || (to_jsonb(r) ->> TG_ARGV[1]), '') AS topic
      FROM new_rows r) s;
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_notifications_live() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.core_live_topic(s.org_id, 'inbox', s.users)
    FROM (SELECT org_id, array_agg(DISTINCT user_id) AS users FROM old_rows GROUP BY org_id) s;
  ELSE
    PERFORM public.core_live_topic(s.org_id, 'inbox', s.users)
    FROM (SELECT org_id, array_agg(DISTINCT user_id) AS users FROM new_rows GROUP BY org_id) s;
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_audit_logs_chain() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  last_seq bigint;
  last_hash text;
BEGIN
  -- One writer per organisation at a time, so the chain has no forks.
  PERFORM pg_advisory_xact_lock(hashtext('core:audit:' || NEW.org_id));
  SELECT chain_seq, hash INTO last_seq, last_hash
    FROM public.core_audit_logs
    WHERE org_id = NEW.org_id AND chain_seq IS NOT NULL
    ORDER BY chain_seq DESC
    LIMIT 1;
  NEW.chain_seq := coalesce(last_seq, 0) + 1;
  NEW.prev_hash := last_hash;
  NEW.hash := public.core_audit_entry_hash(last_hash, NEW);
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_audit_logs_protect() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'core_audit_logs is append-only';
  END IF;
  IF current_setting('core.audit_prune', true) = 'on'
     OR NOT EXISTS (SELECT 1 FROM public.core_organizations WHERE id = OLD.org_id) THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'core_audit_logs is append-only: entries are removed only by retention';
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_audit_logs_no_truncate() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  RAISE EXCEPTION 'core_audit_logs is append-only';
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_audit_checkpoints_protect() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF TG_OP = 'DELETE' AND NOT EXISTS (SELECT 1 FROM public.core_organizations WHERE id = OLD.org_id) THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'core_audit_checkpoints is append-only';
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_grant_data(p_role text) RETURNS void
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
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
CREATE OR REPLACE FUNCTION core_grant_runtime(p_role text) RETURNS void
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  PERFORM public.core_grant_data(p_role);
  PERFORM public.core_grant_data('erxes_core_system');
  EXECUTE format('GRANT erxes_core_system TO %I WITH INHERIT FALSE, SET TRUE', p_role);
  EXECUTE format('GRANT erxes_core_reader TO %I WITH INHERIT TRUE', p_role);
  GRANT erxes_core_reader TO erxes_core_system WITH INHERIT TRUE;
END $$;
