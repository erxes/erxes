/**
 * Applies core's migrations as the owner role (DATA_MIGRATION_URL, else
 * DATA_URL), then grants the runtime role what it needs when DATA_RUNTIME_ROLE
 * is set:  pnpm db:migrate
 */
import { closeDb, configureDb, rootDb, runMigrations } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { config } from '~/config';

const main = async () => {
  configureDb({
    ...config.data,
    url: config.data.migrationUrl ?? config.data.url,
    role: undefined,
    applicationName: 'erxes-core-migrate',
  });

  const applied = await runMigrations();

  console.log(applied.length ? `applied: ${applied.join(', ')}` : 'up to date');

  const runtime = process.env.DATA_RUNTIME_ROLE?.trim();

  if (runtime) {
    await rootDb().execute(sql`select core_grant_runtime(${runtime})`);
    console.log(`granted ${runtime} access to core's tables`);
  }
};

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
