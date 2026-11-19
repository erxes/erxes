import type { PluginImportResult } from '@erxes/core-contract';
import { type Db, importRows, withOrg } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { inOrder } from '~/lib/sequence';
import { defineJob } from '~/modules/jobs/jobs';
import { afterBatch, batchRows, importer, stepKey } from './importJobs';
import { fail, type ImportRow, importOrThrow, type Row } from './importState';
import { importBatch, pluginTransfer } from './pluginTransfer';

type Payload = { importId: string; after: string | number };

/** Each row's non-empty mapped cells, trimmed, by column key. */
const valuesOf = (mapping: ImportRow['mapping'], cells: string[]) =>
  Object.fromEntries(
    Object.entries(mapping).flatMap(([index, key]) => {
      const raw = (cells[Number(index)] ?? '').trim();

      return raw ? [[key, raw]] : [];
    }),
  );

/** The batch to send, or null when the import is no longer at this step. */
const readBatch = async (tx: Db, payload: Payload, dry: boolean) => {
  const imp = await importOrThrow(tx, payload.importId);

  if (imp.status !== (dry ? 'checking' : 'running')) return null;

  const member = await importer(tx, imp);

  if (!member) return null;

  return {
    imp,
    member,
    rows: await batchRows(tx, imp.id, payload.after),
    spec: await pluginTransfer(tx, imp.recordType),
  };
};

type Batch = NonNullable<Awaited<ReturnType<typeof readBatch>>>;

/** Keeps what the plugin said for each row; a row it left out is an error. */
const keepResults = async (tx: Db, imp: ImportRow, rows: Row[], result: PluginImportResult) => {
  const said = new Map(result.rows.map((row) => [row.rowNumber, row]));

  await inOrder(rows, async (row) => {
    const answer = said.get(row.rowNumber);

    await tx
      .update(importRows)
      .set({
        action: answer?.action ?? 'error',
        error: answer
          ? (answer.error?.slice(0, 500) ?? null)
          : 'The plugin did not answer for this row',
        recordId: answer?.recordId ?? null,
      })
      .where(and(eq(importRows.importId, imp.id), eq(importRows.rowNumber, row.rowNumber)));
  });
};

/**
 * The check and the run of a plugin's records: each batch is read in one scope, sent to
 * `<api.url>/transfer/import` outside any, and its results kept in a second, with the next
 * batch queued there. A retried batch carries the same `requestId`.
 */
const pluginBatchJob = (queue: 'import.plugin.check' | 'import.plugin.run', dry: boolean) => {
  const job = defineJob({
    queue,
    timeoutSeconds: 600,
    retry: { attempts: 3 },
    payload: z.object({ importId: z.string(), after: z.union([z.string(), z.number()]) }),
    async handle({ orgId, payload }) {
      const batch = await withOrg(orgId, (tx) => readBatch(tx, payload, dry));

      if (!batch) return;

      const { imp, rows } = batch;

      const result = await importBatch(batch.spec, stepKey(imp.id, queue, payload.after), {
        orgId,
        userId: imp.createdBy,
        reach: batch.member.reach.level,
        unitIds: [...batch.member.reach.unitIds],
        importId: imp.id,
        dryRun: dry,
        mode: imp.options.mode,
        rows: rows.map((row) => ({
          rowNumber: row.rowNumber,
          values: valuesOf(imp.mapping, row.cells),
        })),
      });

      await withOrg(orgId, (tx) => keepBatch(tx, batch, result));
    },
    async onDead(dead, error, tx) {
      await fail(tx, dead.payload.importId, `Stopped: ${error}`);
    },
  });

  /** The results, unless another attempt moved the import on meanwhile; then the next batch. */
  const keepBatch = async (tx: Db, batch: Batch, result: PluginImportResult) => {
    const now = await importOrThrow(tx, batch.imp.id, true);

    if (now.status !== batch.imp.status || now.processed !== batch.imp.processed) return;

    await keepResults(tx, now, batch.rows, result);
    await afterBatch(tx, {
      imp: now,
      rows: batch.rows,
      member: batch.member,
      dry,
      next: (after) =>
        job.enqueue(tx, {
          orgId: now.orgId,
          payload: { importId: now.id, after },
          dedupeKey: stepKey(now.id, queue, after),
        }),
    });
  };

  return job;
};

export const pluginImportCheckJob = pluginBatchJob('import.plugin.check', true);
export const pluginImportRunJob = pluginBatchJob('import.plugin.run', false);
