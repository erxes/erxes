import type { TransferRecordType } from '@erxes/core-contract';
import { type Db, type ImportOptions, importRows, imports, newId } from '@erxes/core-db';
import { and, asc, eq, sql } from 'drizzle-orm';
import { type Actor, userCaller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { readyFile } from '~/modules/files/files.service';
import { transferColumns } from './columns';
import { importCheckJob, importParseJob, importRunJob, importUndoJob, stepKey } from './importJobs';
import {
  type Action,
  EMPTY,
  ImportAction,
  type ImportRow,
  importOrThrow,
  toDto,
  UNDO_DAYS,
  undoable,
} from './importState';

const defaults = (recordType: TransferRecordType): ImportOptions => ({
  mode: 'create',
  matchBy: recordType === 'company' ? 'name' : 'email',
  createMissing: true,
  runAutomations: false,
});

const sampleOf = async (client: Db, id: string) =>
  (
    await client
      .select({ cells: importRows.cells })
      .from(importRows)
      .where(eq(importRows.importId, id))
      .orderBy(asc(importRows.rowNumber))
      .limit(5)
  ).map((row) => row.cells);

export const listImports = async (client: Db, actor: Actor) => ({
  data: (
    await client
      .select()
      .from(imports)
      .where(eq(imports.orgId, actor.orgId))
      .orderBy(sql`${imports.createdAt} desc`)
      .limit(50)
  ).map((row) => toDto(row)),
});

export const getImport = async (client: Db, actor: Actor, id: string) => {
  const row = await importOrThrow(client, actor.orgId, id);

  return toDto(row, await sampleOf(client, id));
};

/** Starts an import from an uploaded file: it is read in the background, then columns are suggested. */
export const createImport = async (
  client: Db,
  actor: Actor,
  input: { recordType: TransferRecordType; fileId: string },
) => {
  const file = await readyFile(client, actor.orgId, input.fileId);

  if (!/\.(csv|txt|tsv|xlsx)$/i.test(file.name))
    throw new HttpError(400, 'UNSUPPORTED_FILE', 'Import a .csv or .xlsx file');

  const row = oneRow(
    await client
      .insert(imports)
      .values({
        id: newId(),
        orgId: actor.orgId,
        recordType: input.recordType,
        fileId: file.id,
        fileName: file.name,
        options: defaults(input.recordType),
        createdBy: actor.userId,
      })
      .returning(),
  );

  await importParseJob.enqueue(client, {
    orgId: row.orgId,
    payload: { importId: row.id },
    maxAttempts: 3,
    dedupeKey: stepKey(row.id, importParseJob.queue),
  });

  return toDto(row);
};

/** Each mapped field must be importable and take one column. */
const checkMapping = async (
  client: Db,
  actor: Actor,
  row: ImportRow,
  mapping: Record<string, string>,
) => {
  const columns = await transferColumns(client, actor.orgId, row.recordType);
  const keys = Object.values(mapping);
  const unknown = keys.find((key) => !columns.some((item) => item.key === key && item.importable));

  if (unknown) throw new HttpError(400, 'INVALID_MAPPING', `Unknown field: ${unknown}`);

  if (new Set(keys).size !== keys.length)
    throw new HttpError(400, 'INVALID_MAPPING', 'Each field can take one column');
};

/** Mapping and options can change until it runs; the check's results are cleared. */
export const updateImport = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { mapping?: Record<string, string>; options?: Partial<ImportOptions> },
) => {
  const row = await importOrThrow(client, actor.orgId, id, true);

  if (!['mapping', 'checked'].includes(row.status))
    throw new HttpError(409, 'IMPORT_LOCKED', `The import is ${row.status}`);

  const mapping = input.mapping ?? row.mapping;

  await checkMapping(client, actor, row, mapping);

  const options = { ...row.options, ...input.options };

  if (row.recordType !== 'company' && options.matchBy === 'name')
    throw new HttpError(400, 'INVALID_OPTIONS', 'Customers match by email, phone, code or ID');

  const next = oneRow(
    await client
      .update(imports)
      .set({
        mapping,
        options,
        status: 'mapping',
        counts: { ...EMPTY, rows: row.counts.rows },
        processed: 0,
        updatedAt: sql`now()`,
      })
      .where(eq(imports.id, id))
      .returning(),
  );

  await client
    .update(importRows)
    .set({ action: null, error: null })
    .where(eq(importRows.importId, id));

  return toDto(next, await sampleOf(client, id));
};

const begin = async (client: Db, actor: Actor, id: string, status: 'checking' | 'running') => {
  const row = await importOrThrow(client, actor.orgId, id, true);

  if (row.status !== 'mapping' && row.status !== 'checked')
    throw new HttpError(409, 'IMPORT_LOCKED', `The import is ${row.status}`);

  if (!Object.keys(row.mapping).length)
    throw new HttpError(400, 'INVALID_MAPPING', 'Map at least one column');

  const next = oneRow(
    await client
      .update(imports)
      .set({ status, processed: 0, error: null, updatedAt: sql`now()` })
      .where(eq(imports.id, id))
      .returning(),
  );

  const job = status === 'checking' ? importCheckJob : importRunJob;
  // A fresh key each start (a check can be run again after changes).
  const after = `0:${newId()}`;

  await job.enqueue(client, {
    orgId: next.orgId,
    payload: { importId: next.id, after },
    maxAttempts: 3,
    dedupeKey: stepKey(next.id, job.queue, after),
  });

  return toDto(next);
};

export const checkImport = (client: Db, actor: Actor, id: string) =>
  begin(client, actor, id, 'checking');

export const startImport = (client: Db, actor: Actor, id: string) =>
  begin(client, actor, id, 'running');

/** Removes the records it created (to the recycle bin), within 30 days; what it updated stays. */
export const undoImport = async (client: Db, actor: Actor, id: string) => {
  const row = await importOrThrow(client, actor.orgId, id, true);

  if (!undoable(row))
    throw new HttpError(
      409,
      'NOT_UNDOABLE',
      `Only imports that created records, in the last ${UNDO_DAYS} days`,
    );

  const next = oneRow(
    await client
      .update(imports)
      .set({ status: 'running', updatedAt: sql`now()` })
      .where(eq(imports.id, id))
      .returning(),
  );

  await importUndoJob.enqueue(client, {
    orgId: next.orgId,
    payload: { importId: next.id, by: actor.userId },
    maxAttempts: 3,
    dedupeKey: stepKey(next.id, importUndoJob.queue),
  });
  await recordAudit(client, userCaller(actor), {
    action: 'import.undone',
    targetType: 'import',
    targetId: id,
    targetLabel: row.fileName,
  });

  return toDto(next);
};

export const listImportRows = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { action?: Action; limit: number },
) => {
  await importOrThrow(client, actor.orgId, id);

  const rows = await client
    .select()
    .from(importRows)
    .where(
      and(
        eq(importRows.importId, id),
        input.action ? eq(importRows.action, input.action) : undefined,
      ),
    )
    .orderBy(asc(importRows.rowNumber))
    .limit(input.limit);

  return {
    data: rows.map((row) => ({
      rowNumber: row.rowNumber,
      cells: row.cells,
      action: ImportAction.nullable().parse(row.action),
      error: row.error,
      recordId: row.recordId,
    })),
  };
};
