-- A plugin granted `records:extend` (Data Extensions) keeps tables an organisation's members
-- design at runtime, one Postgres schema per organisation, the way Twenty keeps a schema per
-- workspace. Plugin roles can't create schemas, so core creates it here: named
-- `<plugin>_<org id>`, owned by core, and open to that plugin's role alone, which then creates
-- and owns the tables in it. Callers quote the name, since org ids are mixed case.
--
--   SELECT core_plugin_org_schema('<org id>');
--
-- Plugin roles may create functions in public, and a `public.format(text, text)` would win over
-- the variadic built-in and run as core. So the search path is pg_catalog alone, and core's
-- own objects are named with their schema.
CREATE OR REPLACE FUNCTION core_plugin_org_schema(p_org_id text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_plugin text := public.core_plugin_caller();
  v_schema text;
BEGIN
  IF v_plugin IS NULL THEN
    RAISE EXCEPTION 'core_plugin_org_schema: only a plugin''s database role may call it';
  END IF;
  IF p_org_id !~ '^[A-Za-z0-9]{1,40}$' THEN
    RAISE EXCEPTION 'core_plugin_org_schema: invalid organisation id %', p_org_id;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.core_plugin_installations i JOIN public.core_plugins p ON p.name = i.plugin
    WHERE i.org_id = p_org_id AND i.plugin = v_plugin AND i.status = 'active' AND p.status = 'active'
      AND 'records:extend' = ANY (i.granted_scopes)
      -- Still asked for: a manifest without it dropped it; no manifest yet asks for every scope.
      AND coalesce(p.manifest -> 'scopes' ? 'records:extend', true)
  ) THEN
    RAISE EXCEPTION '% is not installed with records:extend in organisation %', v_plugin, p_org_id;
  END IF;
  v_schema := v_plugin || '_' || p_org_id;
  IF length(v_schema) > 63 THEN
    RAISE EXCEPTION 'core_plugin_org_schema: % is longer than Postgres names may be', v_schema;
  END IF;
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', v_schema);
  EXECUTE format('GRANT USAGE, CREATE ON SCHEMA %I TO %I', v_schema, 'erxes_plugin_' || v_plugin);
  RETURN v_schema;
END $$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION core_plugin_org_schema(text) FROM PUBLIC;
--> statement-breakpoint
-- Plugin roles made before this migration; `pnpm db:plugin-role` grants it to new ones.
DO $$
DECLARE
  r text;
BEGIN
  FOR r IN SELECT rolname FROM pg_roles WHERE rolname ~ '^erxes_plugin_[a-z_][a-z0-9_]*$' LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION core_plugin_org_schema TO %I', r);
  END LOOP;
END $$;
--> statement-breakpoint
-- The tenancy guard also checks the tables a plugin keeps in its organisation schemas: row
-- level security forced with the tenant policy, as on its tables in public, so a query sent to
-- the wrong organisation's schema still sees no rows. Only tables in public need the plugin's
-- name as their prefix; an organisation schema already carries it. A materialized view can't
-- have row level security, so it would show every organisation the rows it cached: refused.
-- It runs with pg_catalog alone on its search path, so a plugin's function can't stand in for
-- a built-in it calls.
CREATE OR REPLACE FUNCTION core_plugin_tenancy_problems(p_plugin text DEFAULT NULL) RETURNS SETOF text
LANGUAGE sql STABLE SET search_path = pg_catalog, pg_temp AS $$
  WITH owned AS (
    SELECT c.oid, n.nspname, c.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity,
      substring(r.rolname from '^erxes_plugin_([a-z_][a-z0-9_]*)$') AS plugin
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles r ON r.oid = c.relowner
    WHERE c.relkind IN ('r', 'p', 'f', 'm')
      AND r.rolname ~ '^erxes_plugin_[a-z_][a-z0-9_]*$'
  ),
  plugin_tables AS (
    SELECT o.*, CASE WHEN o.nspname = 'public' THEN o.relname ELSE format('%I.%I', o.nspname, o.relname) END AS shown
    FROM owned o
    WHERE o.nspname = 'public' OR left(o.nspname, length(o.plugin) + 1) = o.plugin || '_'
  ),
  checked AS (
    SELECT t.*,
      EXISTS (
        SELECT 1 FROM pg_policies p
        WHERE p.schemaname = t.nspname AND p.tablename = t.relname AND p.policyname = 'tenant'
          AND p.permissive = 'PERMISSIVE' AND p.cmd = 'ALL'
          -- Shown with its schema, since public is not on this function's search path.
          AND p.qual ~ '^public\.core_tenant_visible\([a-z_][a-z0-9_]*\)$' AND p.with_check = p.qual
      ) AS has_tenant_policy
    FROM plugin_tables t
    WHERE (p_plugin IS NULL OR t.plugin = p_plugin)
      AND NOT (t.nspname = 'public' AND t.relname = ('__drizzle_migrations_' || t.plugin))
  )
  SELECT format('%s: %s', shown, concat_ws(', ',
    CASE WHEN nspname = 'public' AND left(relname, length(plugin) + 1) <> plugin || '_'
      THEN format('owned by plugin %s, so its name must start with %s_', plugin, plugin) END,
    CASE WHEN relkind = 'm'
      THEN 'a materialized view shows every organisation the rows it cached: use a table with row level security' END,
    CASE WHEN relkind <> 'm' AND NOT relrowsecurity THEN 'row level security is off' END,
    CASE WHEN relkind <> 'm' AND NOT relforcerowsecurity THEN 'row level security is not forced' END,
    CASE WHEN relkind <> 'm' AND NOT has_tenant_policy THEN 'no tenant policy: run SELECT core_enable_tenant_rls(''' || shown || ''')' END))
  FROM checked
  WHERE (nspname = 'public' AND left(relname, length(plugin) + 1) <> plugin || '_')
    OR relkind = 'm'
    OR NOT (relrowsecurity AND relforcerowsecurity AND has_tenant_policy)
  UNION ALL
  SELECT format('%s: permissive policy %s is not the tenant check, so it lets more rows through', c.shown, p.policyname)
  FROM checked c
  JOIN pg_policies p ON p.schemaname = c.nspname AND p.tablename = c.relname
  WHERE p.permissive = 'PERMISSIVE' AND p.policyname <> 'tenant'
  ORDER BY 1
$$;
