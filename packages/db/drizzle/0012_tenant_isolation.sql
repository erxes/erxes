-- Tenant isolation: row level security on every core table that belongs to
-- an organisation. A transaction sees and writes an organisation's rows only
-- after `set_config('app.org_id', <id>, true)`, or all of them with
-- `set_config('app.system', 'on', true)` (jobs). Forced, so the table owner
-- obeys it as well; only roles with BYPASSRLS (and superusers) skip it, which
-- the API refuses in production.
CREATE OR REPLACE FUNCTION core_tenant_visible(p_org_id text) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT p_org_id = current_setting('app.org_id', true)
      OR coalesce(current_setting('app.system', true), '') = 'on'
$$;
--> statement-breakpoint
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT c.table_name FROM information_schema.columns c
    JOIN information_schema.tables tb ON tb.table_schema = c.table_schema AND tb.table_name = c.table_name
    WHERE c.table_schema = 'public' AND c.column_name = 'org_id' AND c.table_name LIKE 'core\_%' AND tb.table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS core_tenant ON %I', t);
    EXECUTE format(
      'CREATE POLICY core_tenant ON %I USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id))', t);
  END LOOP;
END $$;
--> statement-breakpoint
ALTER TABLE core_organizations ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_organizations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_organizations USING (core_tenant_visible(id)) WITH CHECK (core_tenant_visible(id));
--> statement-breakpoint
-- Functions plugins on this database call inside their own transactions: they
-- enter the organisation's scope (or check it matches the one already set)
-- and refuse plugins the organisation hasn't installed.
CREATE OR REPLACE FUNCTION core_enter_org(p_org_id text, p_plugin text) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  v_current text := nullif(current_setting('app.org_id', true), '');
BEGIN
  IF coalesce(current_setting('app.system', true), '') <> 'on' THEN
    IF v_current IS NULL THEN
      PERFORM set_config('app.org_id', p_org_id, true);
    ELSIF v_current <> p_org_id THEN
      RAISE EXCEPTION 'this transaction works for organisation %, not %', v_current, p_org_id;
    END IF;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM core_plugin_installations i JOIN core_plugins p ON p.name = i.plugin
    WHERE i.org_id = p_org_id AND i.plugin = p_plugin AND i.status = 'active' AND p.status = 'active'
  ) THEN
    RAISE EXCEPTION '% is not installed in organisation %', p_plugin, p_org_id;
  END IF;
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
  PERFORM core_enter_org(p_org_id, p_source);
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
  PERFORM core_enter_org(p_org_id, p_source);
  INSERT INTO core_audit_logs (
    id, org_id, source, actor_type, actor_id, action, target_type, target_id, target_label, changes, metadata, ip, user_agent
  ) VALUES (
    v_id, p_org_id, p_source, CASE WHEN p_actor_user_id IS NULL THEN 'plugin' ELSE 'user' END,
    coalesce(p_actor_user_id, p_source), p_action, p_target_type, p_target_id, p_target_label,
    p_changes, p_metadata, p_ip, p_user_agent
  );
  RETURN v_id;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_live_signal(p_org_id text, p_plugin text, p_topic text, p_user_ids text[] DEFAULT NULL)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  chunk text[];
  total int := coalesce(array_length(p_user_ids, 1), 0);
  i int := 1;
BEGIN
  IF p_plugin !~ '^[a-z][a-z0-9_]{0,39}$' OR p_topic !~ '^[a-z0-9][a-z0-9._:-]{0,99}$' THEN
    RAISE EXCEPTION 'core_live_signal: invalid plugin or topic';
  END IF;
  PERFORM core_enter_org(p_org_id, p_plugin);
  IF total = 0 THEN
    PERFORM pg_notify('core_live', json_build_object('o', p_org_id, 'k', 'plugin', 'p', p_plugin, 't', p_topic)::text);
    RETURN;
  END IF;
  WHILE i <= total LOOP
    chunk := p_user_ids[i:i + 99];
    PERFORM pg_notify('core_live', json_build_object('o', p_org_id, 'k', 'plugin', 'p', p_plugin, 't', p_topic, 'u', chunk)::text);
    i := i + 100;
  END LOOP;
END $$;
--> statement-breakpoint
-- The API's runtime role: data only (no DDL, no BYPASSRLS). `pnpm db:grant
-- <role>` (or this function, as the owner) grants it everything it needs on
-- core's tables, now and for tables later migrations add.
CREATE OR REPLACE FUNCTION core_grant_runtime(p_role text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', p_role);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I', p_role);
  EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO %I', p_role);
  EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO %I', p_role);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', p_role);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO %I', p_role);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO %I', p_role);
END $$;
