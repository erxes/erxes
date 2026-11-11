import { schema } from '@erxes/core-db';
import { generateDrizzleJson, generateMigration } from 'drizzle-kit/api';
import { Client } from 'pg';
import { describe, expect, it } from 'vite-plus/test';
import { admin, useTestDatabase } from './support';

/**
 * Core's tables as Postgres prints them: columns with type, NOT NULL and
 * default, constraints (primary and foreign keys, unique, check) and indexes.
 * Column order is left out: a migration adds a column at the end.
 */
const CATALOG = `
  select 'table ' || c.relname as line
  from pg_class c
  where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p') and c.relname like 'core\\_%'
  union all
  select 'column ' || c.relname || '.' || a.attname || ' ' || format_type(a.atttypid, a.atttypmod)
    || case when a.attnotnull then ' not null' else '' end
    || coalesce(' default ' || pg_get_expr(d.adbin, d.adrelid), '')
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
  where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p') and c.relname like 'core\\_%'
    and a.attnum > 0 and not a.attisdropped
  union all
  select 'constraint ' || c.relname || '.' || k.conname || ' ' || pg_get_constraintdef(k.oid)
  from pg_constraint k
  join pg_class c on c.oid = k.conrelid
  where c.relnamespace = 'public'::regnamespace and c.relname like 'core\\_%'
  union all
  select 'index ' || indexdef
  from pg_indexes
  where schemaname = 'public' and tablename like 'core\\_%'
  order by 1
`;

const withClient = async <T>(url: string, run: (client: Client) => Promise<T>) => {
  const client = new Client({ connectionString: url });

  await client.connect();

  try {
    return await run(client);
  } finally {
    await client.end();
  }
};

const catalogOf = (client: Client) =>
  client.query<{ line: string }>(CATALOG).then((result) => result.rows.map((row) => row.line));

describe('migrations', () => {
  const migrated = useTestDatabase();

  // check:generated compares the schema with the migration snapshots, never
  // the SQL, so a hand-edited migration can drop a table, column, index or
  // constraint unseen. This builds a second database straight from the
  // schema and compares the two.
  it('build the database packages/db/src/schema declares', async () => {
    const declared = new URL(migrated.url());
    const name = `${declared.pathname.slice(1)}_declared`;

    declared.pathname = `/${name}`;
    await admin(`CREATE DATABASE "${name}"`);

    try {
      const statements = await generateMigration(
        generateDrizzleJson({}),
        generateDrizzleJson(schema, undefined, undefined, 'snake_case'),
      );

      const expected = await withClient(declared.toString(), async (client) => {
        for (const statement of statements) {
          await client.query(statement);
        }

        return catalogOf(client);
      });

      const actual = await withClient(migrated.url(), catalogOf);

      expect(actual).toEqual(expected);
    } finally {
      await admin(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    }
  });
});
