/**
 * Applies core's migrations as the owner role (DATA_MIGRATION_URL, else
 * DATA_URL), then grants the runtime role what it needs when DATA_RUNTIME_ROLE
 * is set:  pnpm db:migrate
 */
import { configureDb, rootDb, runMigrations } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { config } from '~/config';
import { runCli, say } from './cli';

const main = async () => {
  configureDb({
    ...config.data,
    url: config.data.migrationUrl ?? config.data.url,
    role: undefined,
    applicationName: 'erxes-core-migrate',
  });

  const applied = await runMigrations();

  say(applied.length ? `applied: ${applied.join(', ')}` : 'up to date');

  const runtime = config.data.runtimeRole;

  if (runtime) {
    await rootDb().execute(sql`select core_grant_runtime(${runtime})`);
    say(`granted ${runtime} access to core's tables`);
  }
};

runCli(main);
