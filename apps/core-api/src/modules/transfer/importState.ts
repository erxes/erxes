import { type Import, ImportRow as ImportRowDto } from '@erxes/core-contract';
import { type Db, type ImportCounts, type importRows, imports, roles, users } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import type { z } from 'zod';
import type { Actor } from '~/http/auth';
import { notFound } from '~/http/errors';

export type ImportRow = typeof imports.$inferSelect;

export type Row = typeof importRows.$inferSelect;

/** What a row did (stored as text): create, update, skip or error. */
export const ImportAction = ImportRowDto.shape.action.unwrap();

export type Action = z.infer<typeof ImportAction>;

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

export const toDto = (row: ImportRow, sample: string[][] = []): Import => ({
  id: row.id,
  recordType: row.recordType,
  fileName: row.fileName,
  status: row.status,
  headers: row.headers,
  mapping: row.mapping,
  options: row.options,
  counts: row.counts,
  processed: row.processed,
  sample,
  error: row.error,
  undoable: undoable(row),
  createdBy: row.createdBy,
  createdAt: row.createdAt.toISOString(),
  finishedAt: row.finishedAt?.toISOString() ?? null,
});

export const importOrThrow = async (client: Db, orgId: string, id: string, lock = false) => {
  const query = client
    .select()
    .from(imports)
    .where(and(eq(imports.orgId, orgId), eq(imports.id, id)))
    .limit(1);

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
export const memberActor = async (tx: Db, orgId: string, userId: string): Promise<Actor> => {
  const [row] = await tx
    .select({
      id: users.id,
      role: users.role,
      status: users.status,
      permissions: roles.permissions,
    })
    .from(users)
    .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
    .where(and(eq(users.orgId, orgId), eq(users.id, userId)))
    .limit(1);

  if (!row || row.status !== 'active')
    throw new ImportFailed('The member who started this import is no longer active');

  return { userId: row.id, orgId, role: row.role, permissions: row.permissions };
};
