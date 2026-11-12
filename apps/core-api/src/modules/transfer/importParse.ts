import { importRows, imports, withOrg } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { readFileBytes } from '~/modules/files/files.service';
import { defineJob } from '~/modules/jobs/jobs';
import { suggestMapping, transferColumns } from './columns';
import { EMPTY, fail, importOrThrow } from './importState';
import { ParseError, parseSheet } from './parse';

/** Stores the parsed rows and the suggested mapping, unless another run already did. */
const storeSheet = (orgId: string, id: string, sheet: Awaited<ReturnType<typeof parseSheet>>) =>
  withOrg(orgId, async (tx) => {
    const row = await importOrThrow(tx, orgId, id, true);

    if (row.status !== 'parsing') return;

    const { headers, rows } = sheet;

    for (let start = 0; start < rows.length; start += 1000) {
      await tx.insert(importRows).values(
        rows.slice(start, start + 1000).map((cells, index) => ({
          orgId,
          importId: row.id,
          rowNumber: start + index + 2,
          cells,
        })),
      );
    }

    const columns = await transferColumns(tx, orgId, row.recordType);

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
  });

/**
 * Reads the file into rows and suggests the mapping. The file is read from
 * storage between two scopes, so no transaction waits on it.
 */
export const importParseJob = defineJob({
  queue: 'import.parse',
  leaseSeconds: 300,
  payload: z.object({ importId: z.string() }),
  async handle(job) {
    const { orgId } = job;
    const { importId } = job.payload;
    const row = await withOrg(orgId, (tx) => importOrThrow(tx, orgId, importId));

    if (row.status !== 'parsing') return;

    const { row: file, body } = await readFileBytes(orgId, row.fileId);

    const sheet = await parseSheet(body, file.name, file.contentType).catch((error: unknown) => {
      if (error instanceof ParseError) return error;
      throw error;
    });

    if (sheet instanceof ParseError) {
      await withOrg(orgId, (tx) => fail(tx, importId, sheet.message));

      return;
    }

    await storeSheet(orgId, importId, sheet);
  },
  async onDead(job, error, tx) {
    await fail(tx, job.payload.importId, `The file could not be read: ${error}`);
  },
});
