// Copies one organisation's documents from the old erxes Mongo into this
// plugin's tables, following migration/import-map.ts.
//
//   MONGO_URL=mongodb://… DATA_URL=postgres://… ORG_ID=<core org id> \
//     pnpm migrate:import [-- --only <collection>]
//
// Rows keep the Mongo `_id` as `id`, so running it again skips what it already
// copied. Tables not in the database yet, and fields with no column, are skipped
// and listed at the end.
import { parseArgs } from 'node:util';
import { MongoClient, ObjectId } from 'mongodb';
import { Pool } from 'pg';
import { IMPORT_MAP } from '../migration/import-map.ts';

const BATCH = 500;

const { values: args } = parseArgs({ options: { only: { type: 'string' } } });
const { MONGO_URL, DATA_URL, ORG_ID } = process.env;

if (!MONGO_URL || !DATA_URL || !ORG_ID) {
  console.error('Set MONGO_URL, DATA_URL and ORG_ID.');
  process.exit(1);
}

type Column = { array: boolean; json: boolean };

const plain = (value: unknown): unknown => {
  if (value instanceof ObjectId) return value.toHexString();

  if (Array.isArray(value)) return value.map(plain);

  if (value instanceof Date || value === null || typeof value !== 'object') return value;

  return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, plain(inner)]));
};

const cell = (value: unknown, column: Column) => {
  const flat = plain(value);

  if (flat === undefined || flat === null) return null;

  if (column.json) return JSON.stringify(flat);

  // An array column takes an array as it is and a single value as a one-item array.
  if (column.array) return [flat].flat();

  if (typeof flat === 'object' && !(flat instanceof Date)) return JSON.stringify(flat);

  return flat;
};

const mongo = await MongoClient.connect(MONGO_URL);
const pool = new Pool({ connectionString: DATA_URL });
const skipped: string[] = [];

try {
  for (const { collection, table, columns } of IMPORT_MAP) {
    if (args.only && args.only !== collection) continue;

    const { rows: described } = await pool.query<{ column_name: string; data_type: string }>(
      'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1',
      [table],
    );

    if (described.length === 0) {
      skipped.push(`${collection}: no table ${table} yet`);
      continue;
    }

    const known = new Map(
      described.map(({ column_name, data_type }) => [
        column_name,
        { array: data_type === 'ARRAY', json: data_type === 'jsonb' || data_type === 'json' },
      ]),
    );

    const fields = Object.entries(columns).filter(([field, name]) => {
      if (known.has(name)) return true;
      skipped.push(`${collection}.${field}: no column ${table}.${name}`);

      return false;
    });

    const names = ['org_id', ...fields.map(([, name]) => name)];
    const cursor = mongo.db().collection(collection).find({}, { batchSize: BATCH });
    let copied = 0;
    let seen = 0;

    const insert = async (batch: unknown[][]) => {
      const placeholders = batch.map(
        (_, row) => `(${names.map((__, col) => `$${row * names.length + col + 1}`).join(', ')})`,
      );

      const client = await pool.connect();

      try {
        await client.query('BEGIN');
        await client.query("SELECT set_config('app.org_id', $1, true)", [ORG_ID]);

        const result = await client.query(
          `INSERT INTO "${table}" (${names.map((name) => `"${name}"`).join(', ')}) VALUES ${placeholders.join(', ')} ON CONFLICT (id) DO NOTHING`,
          batch.flat(),
        );

        await client.query('COMMIT');
        copied += result.rowCount ?? 0;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    };

    let batch: unknown[][] = [];

    for await (const document of cursor) {
      seen += 1;
      batch.push([
        ORG_ID,
        ...fields.map(([field, name]) => {
          const column = known.get(name) ?? { array: false, json: false };

          return cell(document[field], column);
        }),
      ]);

      if (batch.length === BATCH) {
        await insert(batch);
        batch = [];
      }
    }

    if (batch.length > 0) await insert(batch);

    console.info(`${collection} → ${table}: ${copied} of ${seen} copied`);
  }
} finally {
  await mongo.close();
  await pool.end();
}

if (skipped.length > 0) console.info(`Skipped:\n  ${skipped.join('\n  ')}`);
