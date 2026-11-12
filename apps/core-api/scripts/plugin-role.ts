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
import { configureDb, rootDb } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { config } from '~/config';
import { pluginRoleSql } from '~/modules/plugins/pluginRole';
import { runCli, say } from './cli';

const name = process.argv.slice(2).find((arg) => arg !== '--');

const main = async () => {
  const password = randomBytes(24).toString('base64url');

  configureDb({
    ...config.data,
    url: config.data.migrationUrl ?? config.data.url,
    role: undefined,
  });
  await rootDb().execute(sql.raw(pluginRoleSql(name ?? '', password)));
  say(`Role erxes_plugin_${name} is ready. Its password (shown once):\n\n  ${password}\n`);
  say(
    `The plugin connects with it (DATA_URL), owns its ${name}_* tables, and reaches core only through core's plugin functions.`,
  );
};

runCli(main);
