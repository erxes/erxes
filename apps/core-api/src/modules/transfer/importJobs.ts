import { type Db, type ImportCounts, importRows, imports, newId } from '@erxes/core-db';
import { and, asc, eq, gt, inArray, isNotNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { type Actor, systemCaller, userCaller } from '~/http/auth';
import { withImportCause } from '~/lib/causation';
import { logger } from '~/logger';
import { recordAudit } from '~/modules/audit/audit.service';
import { removeCompanies } from '~/modules/companies/companies.service';
import { removeCustomers } from '~/modules/customers/customers.service';
import { readFileBytes } from '~/modules/files/files.service';
import { defineJob } from '~/modules/jobs/jobs';
import { notify } from '~/modules/notifications/notifications.service';
import { suggestMapping, transferColumns } from './columns';
import type { Context } from './importLookups';
import { processRow } from './importRow';
import {
  type Action,
  BATCH,
  EMPTY,
  fail,
  ImportFailed,
  type ImportRow,
  importOrThrow,
  memberActor,
  type Row,
} from './importState';
import { ParseError, parseSheet } from './parse';

const log = logger.child({ component: 'imports' });

/** A step's dedupe key: the rows a batch starts after (no double batch), or a fresh one. */
export const stepKey = (importId: string, queue: string, after?: string | number) =>
  `${importId}:${queue}:${after ?? newId()}`;

/** Reads the file into rows and suggests the mapping. */
export const importParseJob = defineJob({
  queue: 'import.parse',
  atomic: true,
  leaseSeconds: 300,
  payload: z.object({ importId: z.string() }),
  async handle(job, tx) {
    const row = await importOrThrow(tx, job.orgId, job.payload.importId, true);

    if (row.status !== 'parsing') return;

    try {
      const { row: file, body } = await readFileBytes(tx, job.orgId, row.fileId);
      const { headers, rows } = await parseSheet(body, file.name, file.contentType);

      for (let start = 0; start < rows.length; start += 1000) {
        await tx.insert(importRows).values(
          rows.slice(start, start + 1000).map((cells, index) => ({
            orgId: job.orgId,
            importId: row.id,
            rowNumber: start + index + 2,
            cells,
          })),
        );
      }

      const columns = await transferColumns(tx, job.orgId, row.recordType);

      await tx
        .update(imports)
        .set({
          status: 'mapping',
          headers,
          mapping: suggestMapping(headers, columns),
          counts: { ...EMPTY, rows: rows.length },
          updatedAt: sql`now()`,
        })
        .where(eq(imports.id, row.id));
    } catch (error) {
      if (!(error instanceof ParseError)) throw error;
      await fail(tx, row.id, error.message);
    }
  },
  async onDead(job, error, tx) {
    await fail(tx, job.payload.importId, `The file could not be read: ${error}`);
  },
});

const countsOf = async (tx: Db, id: string, rows: number): Promise<ImportCounts> => {
  const grouped = await tx
    .select({ action: importRows.action, count: sql<number>`count(*)::int` })
    .from(importRows)
    .where(eq(importRows.importId, id))
    .groupBy(importRows.action);

  const count = (action: Action) => grouped.find((item) => item.action === action)?.count ?? 0;

  return {
    rows,
    create: count('create'),
    update: count('update'),
    skip: count('skip'),
    error: count('error'),
  };
};

const contextOf = async (tx: Db, actor: Actor, imp: ImportRow): Promise<Context> => ({
  actor,
  imp,
  isCompany: imp.recordType === 'company',
  columns: new Map(
    (await transferColumns(tx, imp.orgId, imp.recordType)).map((column) => [column.key, column]),
  ),
  owners: new Map(),
  tags: new Map(),
  companies: new Map(),
});

/** Every row of the batch, each result kept on its row. */
const processBatch = async (tx: Db, ctx: Context, rows: Row[], dry: boolean) => {
  const { imp } = ctx;

  await withImportCause({ importId: imp.id, quiet: !imp.options.runAutomations }, async () => {
    for (const row of rows) {
      const result = await processRow(tx, ctx, row, dry);

      await tx
        .update(importRows)
        .set({
          action: result.action,
          error: result.error ?? null,
          recordId: result.recordId ?? null,
        })
        .where(and(eq(importRows.importId, imp.id), eq(importRows.rowNumber, row.rowNumber)));
    }
  });
};

/** The last batch: the counts, the status, and for a run its audit entry and the importer's notice. */
const finish = async (tx: Db, actor: Actor, imp: ImportRow, processed: number, dry: boolean) => {
  const counts = await countsOf(tx, imp.id, imp.counts.rows);

  await tx
    .update(imports)
    .set({
      processed,
      counts,
      status: dry ? 'checked' : 'done',
      finishedAt: dry ? null : sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(eq(imports.id, imp.id));

  if (dry) return;

  await recordAudit(tx, userCaller(actor), {
    action: 'import.completed',
    targetType: 'import',
    targetId: imp.id,
    targetLabel: imp.fileName,
    metadata: { recordType: imp.recordType, ...counts, options: imp.options },
  });
  await notify(tx, systemCaller(imp.orgId), {
    userIds: [imp.createdBy],
    kind: 'core.import.done',
    title: `Import of ${imp.fileName} finished`,
    body: `${counts.create} created, ${counts.update} updated, ${counts.skip} skipped, ${counts.error} with errors`,
    link: `/contacts/settings/import-export?import=${imp.id}`,
    entity: { type: 'import', id: imp.id },
  }).catch((error: unknown) => log.warn({ err: error }, 'could not tell the importer'));
};

/** The importer, or null when the import failed because they can't act any more. */
const importer = async (tx: Db, imp: ImportRow) => {
  try {
    return await memberActor(tx, imp.orgId, imp.createdBy);
  } catch (error) {
    if (!(error instanceof ImportFailed)) throw error;
    await fail(tx, imp.id, error.message);

    return null;
  }
};

/** The check and the run: a batch of rows per job, the next batch queued in the same transaction. */
const batchJob = (queue: 'import.check' | 'import.run', dry: boolean) => {
  const job = defineJob({
    queue,
    atomic: true,
    leaseSeconds: 600,
    // The first batch's `after` carries a nonce (`0:<id>`); later ones the last row number.
    payload: z.object({ importId: z.string(), after: z.union([z.string(), z.number()]) }),
    async handle({ orgId, payload }, tx) {
      const imp = await importOrThrow(tx, orgId, payload.importId, true);

      if (imp.status !== (dry ? 'checking' : 'running')) return;

      const actor = await importer(tx, imp);

      if (!actor) return;

      const rows = await tx
        .select()
        .from(importRows)
        .where(
          and(
            eq(importRows.importId, imp.id),
            gt(importRows.rowNumber, Number(String(payload.after).split(':')[0])),
          ),
        )
        .orderBy(asc(importRows.rowNumber))
        .limit(BATCH);

      await processBatch(tx, await contextOf(tx, actor, imp), rows, dry);

      const processed = imp.processed + rows.length;
      const last = rows.at(-1);

      if (rows.length < BATCH || !last) return finish(tx, actor, imp, processed, dry);

      await tx
        .update(imports)
        .set({ processed, updatedAt: sql`now()` })
        .where(eq(imports.id, imp.id));
      await job.enqueue(tx, {
        orgId,
        payload: { importId: imp.id, after: last.rowNumber },
        maxAttempts: 3,
        dedupeKey: stepKey(imp.id, queue, last.rowNumber),
      });
    },
    async onDead(dead, error, tx) {
      await fail(tx, dead.payload.importId, `Stopped: ${error}`);
    },
  });

  return job;
};

export const importCheckJob = batchJob('import.check', true);
export const importRunJob = batchJob('import.run', false);

/** Undo: the created records to the recycle bin, a batch per job. */
export const importUndoJob = defineJob({
  queue: 'import.undo',
  atomic: true,
  leaseSeconds: 600,
  payload: z.object({
    importId: z.string(),
    by: z.string().optional(),
    after: z.number().optional(),
  }),
  async handle({ orgId, payload }, tx) {
    const imp = await importOrThrow(tx, orgId, payload.importId, true);

    if (imp.status !== 'running') return;

    const actor = await memberActor(tx, orgId, payload.by ?? imp.createdBy);

    const rows = await tx
      .select({ rowNumber: importRows.rowNumber, recordId: importRows.recordId })
      .from(importRows)
      .where(
        and(
          eq(importRows.importId, imp.id),
          eq(importRows.action, 'create'),
          isNotNull(importRows.recordId),
        ),
      )
      .orderBy(asc(importRows.rowNumber))
      .limit(BATCH);

    const ids = rows.flatMap((row) => (row.recordId ? [row.recordId] : []));

    if (ids.length) {
      if (imp.recordType === 'company')
        await removeCompanies(tx, actor, ids, { undoingImport: true });
      else await removeCustomers(tx, actor, ids, { undoingImport: true });

      await tx
        .update(importRows)
        .set({ action: 'skip', error: 'Undone', recordId: null })
        .where(
          and(
            eq(importRows.importId, imp.id),
            inArray(
              importRows.rowNumber,
              rows.map((row) => row.rowNumber),
            ),
          ),
        );
    }

    const last = rows.at(-1);

    if (rows.length < BATCH || !last) {
      await tx
        .update(imports)
        .set({ status: 'undone', updatedAt: sql`now()` })
        .where(eq(imports.id, imp.id));

      return;
    }

    await importUndoJob.enqueue(tx, {
      orgId,
      payload: { importId: imp.id, after: last.rowNumber, by: payload.by },
      maxAttempts: 3,
      dedupeKey: stepKey(imp.id, 'import.undo', last.rowNumber),
    });
  },
  async onDead(job, error, tx) {
    await fail(tx, job.payload.importId, `Undo stopped: ${error}`);
  },
});
