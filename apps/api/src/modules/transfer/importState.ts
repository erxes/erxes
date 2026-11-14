import { type Db, type ImportCounts, importRows, imports } from '@erxes/core-db';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { memberOf } from '~/http/auth';
import { notFound } from '~/http/errors';

export type ImportRow = typeof imports.$inferSelect;

export type Row = typeof importRows.$inferSelect;

/** What a row did: create, update, skip or error. */
export type Action = NonNullable<Row['action']>;

/** Rows per job (each row in its own savepoint). */
export const BATCH = 200;

/** How long an import's created records can be removed again. */
export const UNDO_DAYS = 30;

export const EMPTY: ImportCounts = { rows: 0, create: 0, update: 0, skip: 0, error: 0 };

export const undoable = (row: ImportRow) =>
  row.status === 'done' &&
  !!row.finishedAt &&
  Date.now() - row.finishedAt.getTime() < UNDO_DAYS * 86_400_000 &&
  row.counts.create > 0;

/** Imports as the API answers them: the first rows, to check the mapping, and whether they can be undone. */
export const selectImports = (client: Db) => {
  const first = client
    .select({ cells: importRows.cells, rowNumber: importRows.rowNumber })
    .from(importRows)
    .where(eq(importRows.importId, imports.id))
    .orderBy(importRows.rowNumber)
    .limit(5)
    .as('first');

  return client
    .select({
      ...getTableColumns(imports),
      sample: sql<string[][]>`coalesce(
        (select json_agg(${first.cells} order by ${first.rowNumber}) from ${first}),
        '[]'::json)`,
      undoable: sql<boolean>`(${imports.status} = 'done'
        and ${imports.finishedAt} > now() - make_interval(days => ${UNDO_DAYS})
        and (${imports.counts} ->> 'create')::int > 0)`,
    })
    .from(imports);
};

export const shownImport = async (client: Db, id: string) => {
  const [row] = await selectImports(client).where(eq(imports.id, id)).limit(1);

  if (!row) throw notFound('Import');

  return row;
};

export const importOrThrow = async (client: Db, id: string, lock = false) => {
  const query = client.select().from(imports).where(eq(imports.id, id)).limit(1);

  const [row] = await (lock ? query.for('update') : query);

  if (!row) throw notFound('Import');

  return row;
};

/** A problem with the whole import (not one row): it fails with this message, without retrying. */
export class ImportFailed extends Error {}

export const fail = async (tx: Db, id: string, message: string) => {
  await tx
    .update(imports)
    .set({ status: 'failed', error: message.slice(0, 500), finishedAt: sql`now()` })
    .where(eq(imports.id, id));
};

/** The member the import acts as (its creator, with their permissions now). */
export const importingMember = async (orgId: string, userId: string) => {
  const member = await memberOf(orgId, userId);

  if (!member) throw new ImportFailed('The member who started this import is no longer active');

  return member;
};
