-- A plugin's migration bookkeeping table, `__drizzle_migrations_<name>` (the
-- name create-erxes gives it), holds only migration hashes and no organisation's
-- data, so the tenancy guard no longer lists it. Every other plugin table is
-- checked as before.
CREATE OR REPLACE FUNCTION core_plugin_tenancy_problems(p_plugin text DEFAULT NULL) RETURNS SETOF text
LANGUAGE sql STABLE AS $$
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
          AND p.qual ~ '^core_tenant_visible\([a-z_][a-z0-9_]*\)$' AND p.with_check = p.qual
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
