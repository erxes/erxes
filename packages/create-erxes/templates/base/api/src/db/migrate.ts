import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { sql } from 'drizzle-orm';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { z } from 'zod';
import { db, pool } from './client.ts';

/** Our own tracking table: core and other plugins in the same database keep theirs. */
export const MIGRATIONS_TABLE = '__drizzle_migrations___id__';

const migrationsTable = sql`${sql.identifier('public')}.${sql.identifier(MIGRATIONS_TABLE)}`;

/** `drizzle/` next to `src/` in development (src/db/) and next to `dist/` in the bundle. */
const migrationsFolder = () => {
  const candidates = ['../../drizzle', '../drizzle'].map((dir) =>
    resolve(import.meta.dirname, dir),
  );
  const found = candidates.find((dir) => existsSync(join(dir, 'meta', '_journal.json')));

  if (!found) throw new Error(`No migrations in ${candidates.join(' or ')}`);

  return found;
};

const Journal = z.object({ entries: z.array(z.object({ tag: z.string() })) });

/**
 * Applies pending migrations and returns their tags. One transaction under a
 * transaction-scoped advisory lock, so replicas starting together and
 * transaction poolers are safe. Bookkeeping matches Drizzle's (hash +
 * timestamp), so drizzle-kit keeps working.
 */
export const runMigrations = async () => {
  const folder = migrationsFolder();
  const migrations = readMigrationFiles({ migrationsFolder: folder });
  const { entries } = Journal.parse(
    JSON.parse(readFileSync(join(folder, 'meta', '_journal.json'), 'utf8')),
  );

  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('__id__:migrate'))`);
    await tx.execute(sql`
      create table if not exists ${migrationsTable} (
        id serial primary key,
        hash text not null,
        created_at bigint
      )
    `);

    const { rows } = await tx.execute<{ created_at: string | null }>(
      sql`select created_at from ${migrationsTable} order by created_at desc limit 1`,
    );
    const last = Number(rows[0]?.created_at ?? 0);
    const applied: string[] = [];

    for (const [index, migration] of migrations.entries()) {
      if (migration.folderMillis <= last) continue;

      for (const statement of migration.sql) {
        if (statement.trim()) await tx.execute(sql.raw(statement));
      }

      await tx.execute(
        sql`insert into ${migrationsTable} (hash, created_at) values (${migration.hash}, ${migration.folderMillis})`,
      );
      applied.push(entries[index]?.tag ?? String(migration.folderMillis));
    }

    return applied;
  });
};

// `pnpm db:migrate` applies them without starting the API.
if (import.meta.main) {
  await runMigrations();
  await pool.end();
}
