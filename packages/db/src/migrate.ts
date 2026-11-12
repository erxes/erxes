import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getPool } from './client';

/** Core's own tracking table: plugins in the same database keep theirs. */
export const MIGRATIONS_TABLE = '__drizzle_migrations_core';

const migrationsTable = sql`${sql.identifier('public')}.${sql.identifier(
  MIGRATIONS_TABLE,
)}`;

/**
 * Where the SQL migrations are: MIGRATIONS_DIR, next to a built bundle
 * (`dist/drizzle`, copied by the API build), or this package's `drizzle/`.
 */
export const migrationsFolder = (): string => {
  const candidates = [
    process.env.MIGRATIONS_DIR,
    resolve(__dirname, 'drizzle'),
    resolve(__dirname, '..', 'drizzle'),
  ].filter((candidate): candidate is string => Boolean(candidate));

  const found = candidates.find((candidate) =>
    existsSync(join(candidate, 'meta', '_journal.json')),
  );

  if (!found) {
    throw new Error(`No migrations found (looked in ${candidates.join(', ')})`);
  }

  return resolve(found);
};

/**
 * After migrating: nobody gets rights on core's tables by default. Core's
 * runtime role is granted explicitly (`core_grant_runtime`); PUBLIC and
 * Supabase's web API roles (`anon`, `authenticated`), which Supabase grants
 * every new table to, get nothing — plugin roles reach core only through the
 * functions meant for them.
 */
const LOCK_DOWN = `
DO $lock$
DECLARE
  t text;
  r text;
BEGIN
  FOR t IN SELECT format('%I.%I', schemaname, tablename) FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'core\\_%' LOOP
    EXECUTE format('REVOKE ALL ON %s FROM PUBLIC', t);
    FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
        EXECUTE format('REVOKE ALL ON %s FROM %I', t, r);
      END IF;
    END LOOP;
  END LOOP;
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION core_publish_event, core_record_audit, core_live_signal FROM %I', r);
    END IF;
  END LOOP;
END $lock$;
`;

/**
 * Applies pending migrations and returns their tags.
 *
 * One transaction under a transaction-scoped advisory lock: safe with several
 * replicas starting at once and through transaction poolers (PgBouncer,
 * Supavisor), because COMMIT/ROLLBACK always releases the lock. Drizzle's own
 * `migrate()` is not used: it opens its own transaction. Bookkeeping matches
 * Drizzle's (hash + timestamp), so drizzle-kit keeps working.
 */
export const runMigrations = async (
  folder = migrationsFolder(),
): Promise<string[]> => {
  const migrations = readMigrationFiles({
    migrationsFolder: folder,
    migrationsTable: MIGRATIONS_TABLE,
  });
  const { entries } = JSON.parse(
    readFileSync(join(folder, 'meta', '_journal.json'), 'utf8'),
  ) as { entries: { tag: string }[] };

  return drizzle(getPool()).transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('core:migrate'))`);
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS ${migrationsTable} (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

    const { rows } = await tx.execute<{ created_at: string | null }>(
      sql`SELECT created_at FROM ${migrationsTable} ORDER BY created_at DESC LIMIT 1`,
    );
    const last = Number(rows[0]?.created_at ?? 0);
    const applied: string[] = [];

    for (const [index, migration] of migrations.entries()) {
      // Only newer migrations run: when merging branches, renumber yours
      // after the other branch's and give them newer timestamps.
      if (migration.folderMillis <= last) {
        continue;
      }

      for (const statement of migration.sql) {
        if (statement.trim()) {
          await tx.execute(sql.raw(statement));
        }
      }

      await tx.execute(
        sql`INSERT INTO ${migrationsTable} (hash, created_at) VALUES (${migration.hash}, ${migration.folderMillis})`,
      );
      applied.push(entries[index]?.tag ?? String(migration.folderMillis));
    }

    if (applied.length) await tx.execute(sql.raw(LOCK_DOWN));

    return applied;
  });
};
