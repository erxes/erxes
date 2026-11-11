/**
 * Creates (if missing) and grants the API's runtime role: data access to
 * core's tables, no DDL, no BYPASSRLS. Run as the owner:
 *   pnpm db:grant -- erxes_app            (then set its password and use it in DATA_URL)
 */
import { closeDb, configureDb, rootDb } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { config } from '~/config';

const role = process.argv.slice(2).find((arg) => arg !== '--');

const main = async () => {
  if (!role || !/^[a-z_][a-z0-9_]{0,62}$/.test(role)) throw new Error('Usage: pnpm db:grant -- <role name>');

  configureDb({ ...config.data, url: config.data.migrationUrl ?? config.data.url, role: undefined });

  await rootDb().execute(sql.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${role}') THEN
        CREATE ROLE ${role} LOGIN NOBYPASSRLS NOSUPERUSER NOCREATEDB NOCREATEROLE;
      END IF;
    END $$;
  `));
  await rootDb().execute(sql`select core_grant_runtime(${role})`);
  console.log(`${role}: data access granted. Set a password (ALTER ROLE ${role} PASSWORD '…') and use it in DATA_URL;`);
  console.log('keep the owner in DATA_MIGRATION_URL for pnpm db:migrate.');
};

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
