import { closeDb, configureDb, rootDb, runMigrations } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { config } from '~/config';

/**
 * Connects as the owner role (DATA_MIGRATION_URL, else DATA_URL): the DDL and
 * role rights the API's runtime role must not have.
 */
export const connectAsOwner = (applicationName = 'erxes-core-owner') => {
  configureDb({
    ...config.data,
    url: config.data.migrationUrl ?? config.data.url,
    role: undefined,
    applicationName,
  });
};

/** Creates the runtime role if it is missing and grants it data access: no DDL, no BYPASSRLS. */
export const grantRuntime = async (role: string) => {
  if (!/^[a-z_][a-z0-9_]{0,62}$/.test(role)) throw new Error(`invalid role name: ${role}`);

  await rootDb().execute(
    sql.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${role}') THEN
        CREATE ROLE ${role} LOGIN NOBYPASSRLS NOSUPERUSER NOCREATEDB NOCREATEROLE;
      END IF;
    END $$;
  `),
  );
  await rootDb().execute(sql`select core_grant_runtime(${role})`);
};

/**
 * Applies core's migrations as the owner, then grants DATA_RUNTIME_ROLE the
 * tables they added. Closes the owner's pool, so the caller configures the
 * runtime connection after.
 */
export const migrate = async () => {
  connectAsOwner('erxes-core-migrate');

  try {
    const applied = await runMigrations();

    if (config.data.runtimeRole) await grantRuntime(config.data.runtimeRole);

    return applied;
  } finally {
    await closeDb();
  }
};
