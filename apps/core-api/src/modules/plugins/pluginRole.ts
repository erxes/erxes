import { escapeIdentifier, escapeLiteral } from 'pg';

/** Postgres truncates longer identifiers, so two plugins could end up sharing one role. */
const maxIdentifierLength = 63;

/**
 * SQL that creates (or updates) a plugin's own database role, `erxes_plugin_<name>`:
 * it may create and own its tables and reach core only through core's plugin functions.
 */
export const pluginRoleSql = (plugin: string, password?: string) => {
  const roleName = `erxes_plugin_${plugin}`;

  if (
    !/^[a-z_][a-z0-9_]*$/.test(plugin) ||
    plugin === 'core' ||
    roleName.length > maxIdentifierLength
  )
    throw new Error(
      `Invalid plugin name ${JSON.stringify(plugin)}: it must match [a-z_][a-z0-9_]*, not be "core", and keep its role name within ${maxIdentifierLength} characters`,
    );

  const role = escapeIdentifier(roleName);

  return `
    DO $role$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${escapeLiteral(roleName)}) THEN
        CREATE ROLE ${role} ${password ? 'LOGIN' : 'NOLOGIN'} NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
      END IF;
    END $role$;
    ${password ? `ALTER ROLE ${role} LOGIN PASSWORD ${escapeLiteral(password)};` : ''}
    GRANT USAGE, CREATE ON SCHEMA public TO ${role};
    GRANT EXECUTE ON FUNCTION core_publish_event, core_record_audit, core_live_signal, core_enable_tenant_rls, core_tenant_visible, core_plugin_caller TO ${role};
  `;
};
