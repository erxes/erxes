/**
 * The import's moving parts: one Postgres connection, the source databases, the report, and
 * how rows are written. Without --write everything runs in one transaction that is rolled back
 * at the end; with it, each batch commits on its own. A batch that Postgres refuses is retried
 * row by row, so one bad row is skipped and listed, never the whole batch or the run.
 */
import type { Collection, Db, Document, Filter } from 'mongodb';
import type { Client } from 'pg';
import { z } from 'zod';
import { inOrder, repeatWhile } from '~/lib/sequence';
import type { Report } from './report';

const BATCH = 500;

export interface Run {
  /** The main database, `erxes`. */
  mongo: Db;
  /** Any other database on the same server (`erxes_logs`, `erxes_office`). */
  other: (name: string) => Db;
  pg: Client;
  orgId: string;
  write: boolean;
  /** At most this many documents per collection, for trying it out. */
  limit: number;
  report: Report;
}

export interface Rows {
  collection: string;
  table: string;
  columns: string[];
  rows: unknown[][];
  /** The source id of each row, for the report. */
  keys: string[];
  /** What follows the VALUES list; `ON CONFLICT DO NOTHING` when left out. */
  conflict?: string;
}

const ROUNDS = 1_000_000;

let savepoints = 0;

/** Runs `work` in a transaction of its own (--write) or in the dry run's one. */
export const unit = async <T>(run: Run, work: () => Promise<T>): Promise<T> => {
  if (!run.write) return work();

  await run.pg.query('BEGIN');

  try {
    await run.pg.query("select set_config('app.org_id', $1, true)", [run.orgId]);
    const result = await work();

    await run.pg.query('COMMIT');

    return result;
  } catch (error) {
    await run.pg.query('ROLLBACK');
    throw error;
  }
};

/** Runs `work` in a savepoint; a database error rolls back only that and is returned. */
const attempt = async (run: Run, work: () => Promise<number>) => {
  savepoints += 1;
  const name = `s${savepoints}`;

  await run.pg.query(`SAVEPOINT ${name}`);

  try {
    const result = await work();

    await run.pg.query(`RELEASE SAVEPOINT ${name}`);

    return { result, error: null };
  } catch (error) {
    await run.pg.query(`ROLLBACK TO SAVEPOINT ${name}`);

    return { result: 0, error };
  }
};

const Refusal = z.object({ constraint: z.string().min(1) });

/** Why Postgres refused a row: the constraint's name, else the message. */
const reasonOf = (error: unknown) => {
  const refusal = Refusal.safeParse(error);

  if (refusal.success) return `refused by ${refusal.data.constraint}`;

  return `refused: ${error instanceof Error ? error.message : String(error)}`;
};

const statement = (rows: Rows, count: number) => {
  const width = rows.columns.length;

  const values = Array.from(
    { length: count },
    (_, row) =>
      `(${rows.columns.map((_column, column) => `$${row * width + column + 1}`).join(', ')})`,
  );

  return `INSERT INTO ${rows.table} (${rows.columns.map((name) => `"${name}"`).join(', ')}) VALUES ${values.join(', ')} ${rows.conflict ?? 'ON CONFLICT DO NOTHING'}`;
};

/** Inserts the rows and counts them as copied; refused ones are skipped with the reason. */
export const insert = async (run: Run, rows: Rows) => {
  if (!rows.rows.length) return 0;

  const whole = await attempt(run, async () => {
    const result = await run.pg.query(statement(rows, rows.rows.length), rows.rows.flat());

    return result.rowCount ?? 0;
  });

  let copied = whole.result;

  if (whole.error) {
    await inOrder(rows.rows, async (row, index) => {
      const one = await attempt(run, async () => {
        const result = await run.pg.query(statement(rows, 1), row);

        return result.rowCount ?? 0;
      });

      copied += one.result;

      if (one.error) run.report.skip(rows.collection, reasonOf(one.error), rows.keys[index]);
    });
  }

  run.report.copied(rows.collection, copied);

  return copied;
};

/**
 * Reads `collection` in batches of BATCH and hands each to `handle`, in its own unit. The
 * documents count as seen under `name` (the collection's own name by default).
 */
export const eachBatch = async (
  run: Run,
  collection: Collection,
  handle: (documents: Document[]) => Promise<void>,
  filter: Filter<Document> = {},
  name = collection.collectionName,
) => {
  const cursor = collection.find(filter, { batchSize: BATCH, limit: run.limit });

  try {
    await repeatWhile(ROUNDS, async () => {
      if (!(await cursor.hasNext())) return false;

      const documents = cursor.readBufferedDocuments(BATCH);

      run.report.seen(name, documents.length);
      await unit(run, () => handle(documents));

      return true;
    });
  } finally {
    await cursor.close();
  }
};

/** Every document of a small collection (configs, users), read at once. */
export const readAll = (run: Run, name: string, filter: Filter<Document> = {}) =>
  run.mongo.collection(name).find(filter, { limit: run.limit }).toArray();

/**
 * The organisation's rows. The import connects as the migration owner, which row level security
 * doesn't hold back, so lookups name the organisation themselves.
 */
export const MINE = "org_id = current_setting('app.org_id')";

/** The ids of a table's rows in the organisation, as a set (the members, the tags). */
export const idSet = async (run: Run, table: string) =>
  new Set(
    (await run.pg.query<{ id: string }>(`SELECT id FROM ${table} WHERE ${MINE}`)).rows.map(
      (row) => row.id,
    ),
  );
