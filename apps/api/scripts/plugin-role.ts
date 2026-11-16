/**
 * A plugin's own database role, for plugins that keep their tables in core's
 * database:  pnpm db:plugin-role hr
 *
 * `erxes_plugin_hr` may create and own `hr_*` tables, and reach core only
 * through core_publish_event / core_record_audit / core_live_signal /
 * core_enqueue_job (which know it is HR: it can't act as another plugin). It has no rights on any
 * core table, can't bypass row level security, and can't change core's
 * schema. Prints a new password once.
 *
 * `--keep-password` only grants, for deployments whose logins and passwords
 * are made elsewhere (Ansible, a secret store), so it can run on every
 * deploy:  node dist/plugin-role.js hr sales --keep-password
 */
import { configureDb, rootDb } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { parseArgs } from 'node:util';
import { config } from '~/config';
import { randomToken } from '~/lib/crypto';
import { pluginRoleSql } from '~/modules/plugins/pluginRole';
import { runCli, say } from './cli';

const { positionals: names, values } = parseArgs({
  allowPositionals: true,
  options: { 'keep-password': { type: 'boolean', default: false } },
});

const main = async () => {
  if (!names.length)
    throw new Error('Usage: pnpm db:plugin-role <plugin name>... [--keep-password]');

  const keep = values['keep-password'];
  const passwords = new Map(names.map((name) => [name, keep ? undefined : randomToken(24)]));
  const roleSql = names.map((name) => pluginRoleSql(name, passwords.get(name))).join('\n');

  configureDb({
    ...config.data,
    url: config.data.migrationUrl ?? config.data.url,
    role: undefined,
  });
  await rootDb().execute(sql.raw(roleSql));

  for (const [name, password] of passwords) {
    say(
      password
        ? `Role erxes_plugin_${name} is ready. Its password (shown once):\n\n  ${password}\n`
        : `Role erxes_plugin_${name} is granted; its login and password are unchanged.`,
    );
  }

  if (keep) return;

  say(
    `The plugin connects with it (DATA_URL), owns its tables, and reaches core only through core's plugin functions.`,
  );
  say(
    `After its migrations, the plugin's CI runs SELECT * FROM core_plugin_tenancy_problems('<plugin>') and fails on any row.`,
  );
};

runCli(main);
