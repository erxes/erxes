import { closeDb, configureDb, type MigrationSteps, rootDb, runMigrations } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { config } from '~/config';
import { splitConnectionValues } from '~/modules/integrations/splitConnectionValues';

/**
 * Applies core's migrations as the owner (DATA_MIGRATION_URL, else DATA_URL, never as
 * DATA_ROLE), then grants DATA_RUNTIME_ROLE core's tables. Returns the applied tags and
 * closes its pool, so the caller configures its own.
 */
export const MIGRATION_STEPS: MigrationSteps = {
  '0119_connection_settings': splitConnectionValues,
};

export const migrateAsOwner = async (applicationName: string) => {
  configureDb({
    ...config.data,
    url: config.data.migrationUrl ?? config.data.url,
    role: undefined,
    applicationName,
  });

  try {
    const applied = await runMigrations(MIGRATION_STEPS);
    const runtime = config.data.runtimeRole;

    if (runtime) await rootDb().execute(sql`select core_grant_runtime(${runtime})`);

    return { applied, granted: runtime };
  } finally {
    await closeDb();
  }
};
