import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { sql } from 'drizzle-orm';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { z } from 'zod';
import { db } from './client.ts';

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

    const pending = migrations
      .map((migration, index) => ({
        ...migration,
        tag: entries[index]?.tag ?? String(migration.folderMillis),
      }))
      .filter((migration) => migration.folderMillis > last);

    if (!pending.length) return [];

    // A query without parameters goes over Postgres's simple protocol, which runs many
    // statements in order. Each ends on its own line, so a trailing `--` comment can't hide
    // the separator, and an empty statement between two semicolons is allowed.
    await tx.execute(sql.raw(pending.flatMap((migration) => migration.sql).join('\n;\n')));
    await tx.execute(
      sql`insert into ${migrationsTable} (hash, created_at) values ${sql.join(
        pending.map((migration) => sql`(${migration.hash}, ${migration.folderMillis})`),
        sql`, `,
      )}`,
    );

    return pending.map((migration) => migration.tag);
  });
};
