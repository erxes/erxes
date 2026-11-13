/**
 * SQL that creates (or updates) a plugin's own database role, `erxes_plugin_<name>`:
 * it may create and own its tables and reach core only through core's plugin functions.
 */
export const pluginRoleSql = (plugin: string, password?: string) => {
  if (!/^[a-z][a-z0-9_]{0,39}$/.test(plugin) || plugin === 'core')
    throw new Error('Usage: pnpm db:plugin-role <plugin name>');

  const role = `erxes_plugin_${plugin}`;

  return `
    DO $role$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${role}') THEN
        CREATE ROLE ${role} ${password ? 'LOGIN' : 'NOLOGIN'} NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
      END IF;
    END $role$;
    ${password ? `ALTER ROLE ${role} LOGIN PASSWORD '${password}';` : ''}
    GRANT USAGE, CREATE ON SCHEMA public TO ${role};
    GRANT EXECUTE ON FUNCTION core_publish_event, core_record_audit, core_live_signal, core_enable_tenant_rls, core_tenant_visible, core_plugin_caller TO ${role};
  `;
};
