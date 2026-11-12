/**
 * A plugin's own database role, for plugins that keep their tables in core's
 * database:  pnpm db:plugin-role -- hr
 *
 * `erxes_plugin_hr` may create and own `hr_*` tables, and reach core only
 * through core_publish_event / core_record_audit / core_live_signal (which
 * know it is HR: it can't act as another plugin). It has no rights on any
 * core table, can't bypass row level security, and can't change core's
 * schema. Prints a new password once.
 */
import { closeDb, configureDb, rootDb } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { config } from '~/config';

const name = process.argv.slice(2).find((arg) => arg !== '--');

export const pluginRoleSql = (plugin: string, password?: string) => {
  if (!/^[a-z][a-z0-9_]{0,39}$/.test(plugin) || plugin === 'core')
    throw new Error('Usage: pnpm db:plugin-role -- <plugin name>');

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

const main = async () => {
  const password = randomBytes(24).toString('base64url');

  configureDb({
    ...config.data,
    url: config.data.migrationUrl ?? config.data.url,
    role: undefined,
  });
  await rootDb().execute(sql.raw(pluginRoleSql(name ?? '', password)));
  console.log(`Role erxes_plugin_${name} is ready. Its password (shown once):\n\n  ${password}\n`);
  console.log(
    `The plugin connects with it (DATA_URL), owns its ${name}_* tables, and reaches core only through core's plugin functions.`,
  );
};

if (process.argv[1]?.endsWith('plugin-role.ts')) {
  main()
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    })
    .finally(() => closeDb());
}
