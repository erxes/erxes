import type { CursorQuery, ExportQuery, ExportRequest } from '@erxes/core-contract';
import {
  caller,
  companies,
  customers,
  type Db,
  exports,
  newId,
  runAs,
  system,
  withOrg,
} from '@erxes/core-db';
import { and, asc, eq, getTableColumns, gt, inArray, type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { memberOf } from '~/http/auth';
import { fail } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { repeatWhile } from '~/lib/sequence';
import { logger } from '~/logger';
import { recordAudit } from '~/modules/audit/audit.service';
import { companyListWhere } from '~/modules/companies/companyList';
import { customerListWhere } from '~/modules/customers/customerList';
import { customFieldsColumn } from '~/modules/fields/fieldValues';
import { storeServerFile } from '~/modules/files/files.service';
import { defineJob } from '~/modules/jobs/jobs';
import { notify } from '~/modules/notifications/notifications.service';
import { customCell, transferColumns } from './columns';
import { type Cell, type ExportRecord, exportFile, pageCells } from './exportCells';
import {
  assertCanTransfer,
  type CoreRecordType,
  exportPage,
  isCoreType,
  pluginTransfer,
  transferableTypes,
} from './pluginTransfer';

const log = logger.child({ component: 'exports' });

type ExportRow = typeof exports.$inferSelect;

/** At most this many rows per export (narrow the filter for more). */
const MAX_EXPORT_ROWS = 100_000;
const PAGE = 1000;

/** Rows per request to a plugin's `/transfer/export`. */
const PLUGIN_PAGE = 500;

/** Exports of the record types the member may export, newest first. */
export const listExports = async (client: Db, query: CursorQuery) =>
  keysetPage(
    client,
    {
      table: exports,
      id: exports.id,
      createdAt: exports.createdAt,
    },
    inArray(exports.recordType, await transferableTypes(client, 'export')),
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(exports)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

/** The list's conditions, exactly as the list shows them (leads are customers in the lead state). */
const whereOf = (client: Db, recordType: CoreRecordType, query: ExportQuery) => {
  const common = {
    search: query.search,
    tagIds: query.tagIds,
    ownerId: query.ownerId,
    ids: query.ids,
    filter: query.filter ? JSON.stringify(query.filter) : undefined,
  };

  return recordType === 'company'
    ? companyListWhere(client, common)
    : customerListWhere(client, {
        ...common,
        state: recordType === 'lead' ? 'lead' : 'customer',
      });
};

/**
 * Pages through the list (by id, so nothing is missed or repeated), or asks the
 * plugin page by page outside any scope, writes the file to storage outside any
 * scope, then marks the export done and tells the member.
 */
export const exportRunJob = defineJob({
  queue: 'export.run',
  timeoutSeconds: 900,
  retry: { attempts: 3 },
  payload: z.object({ exportId: z.string() }),
  async handle(job) {
    const running = await runningExport(job.orgId, job.payload.exportId);

    if (!running) return;

    const { member, row, header } = running;
    const { recordType } = row;

    const body = isCoreType(recordType)
      ? await withOrg(job.orgId, (tx) => runAs(member, () => collectRows(tx, row, recordType)))
      : await pluginRows(job.orgId, row);

    const built = await fileOf(row, header, body);
    const stored = await runAs(member, () => storeServerFile(job.orgId, built.file));

    await withOrg(job.orgId, (tx) => finishExport(tx, built, stored.id));
  },
  async onDead(job, error, tx) {
    await tx
      .update(exports)
      .set({ status: 'failed', error: error.slice(0, 500), finishedAt: sql`now()` })
      .where(eq(exports.id, job.payload.exportId));
  },
});

/** Starts an export of a list in the background; the member is told when the file is ready. */
export const createExport = async (client: Db, input: ExportRequest) => {
  await assertCanTransfer(client, input.recordType, 'export');

  const available = await transferColumns(client, input.recordType);

  const unknown = input.columns.find(
    (key) => !available.some((item) => item.key === key && item.exportable),
  );

  if (unknown) throw fail('INVALID_COLUMNS', `Unknown column: ${unknown}`);

  // A filter that doesn't fit is refused now, not in the background; a plugin applies its own.
  if (isCoreType(input.recordType)) await whereOf(client, input.recordType, input.query);

  const row = oneRow(
    await client
      .insert(exports)
      .values({
        id: newId(),
        recordType: input.recordType,
        format: input.format,
        columns: input.columns,
        query: input.query,
        createdBy: caller('user').userId,
      })
      .returning(),
  );

  await exportRunJob.enqueue(client, {
    orgId: row.orgId,
    payload: { exportId: row.id },
  });
  // Records leaving erxes: always in the audit log.
  await recordAudit(client, {
    action: isCoreType(input.recordType)
      ? 'contacts.exported'
      : `${input.recordType.replace(':', '.')}.exported`,
    targetType: 'export',
    targetId: row.id,
    targetLabel: input.recordType,
    metadata: { format: input.format, columns: input.columns, query: input.query },
  });

  return row;
};

/** The member who asked, or null (and the export failed) when they are no longer active. */
const exporter = async (tx: Db, row: ExportRow) => {
  const member = await memberOf(row.orgId, row.createdBy);

  if (member) return member;

  await tx
    .update(exports)
    .set({
      status: 'failed',
      error: 'The member who asked is no longer active',
      finishedAt: sql`now()`,
    })
    .where(eq(exports.id, row.id));

  return null;
};

/** One page of the list's records after `last` (by id). */
const pageOf = async (
  tx: Db,
  recordType: CoreRecordType,
  where: SQL | undefined,
  last: string,
): Promise<ExportRecord[]> => {
  if (recordType === 'company') {
    return tx
      .select({
        ...getTableColumns(companies),
        customFields: customFieldsColumn('company', companies.id),
      })
      .from(companies)
      .where(and(where, last ? gt(companies.id, last) : undefined))
      .orderBy(asc(companies.id))
      .limit(PAGE);
  }

  return tx
    .select({
      ...getTableColumns(customers),
      customFields: customFieldsColumn('customer', customers.id),
    })
    .from(customers)
    .where(and(where, last ? gt(customers.id, last) : undefined))
    .orderBy(asc(customers.id))
    .limit(PAGE);
};

/**
 * Every row of the export's list: up to `MAX_EXPORT_ROWS`, and one page past
 * it when there are more, so the caller can tell the list was cut.
 */
const collectRows = async (tx: Db, row: ExportRow, recordType: CoreRecordType) => {
  const where = await whereOf(tx, recordType, row.query);
  const body: Cell[][] = [];
  let last = '';

  // Page after page until a short one, or one page past the limit.
  await repeatWhile(MAX_EXPORT_ROWS / PAGE + 1, async () => {
    const page = await pageOf(tx, recordType, where, last);
    const end = page.at(-1);

    if (!end) return false;

    body.push(...(await pageCells(tx, recordType, page, row.columns)));
    last = end.id;

    return page.length === PAGE && body.length <= MAX_EXPORT_ROWS;
  });

  return body;
};

/**
 * A plugin's records, page by page as its API answers them, outside any scope:
 * up to `MAX_EXPORT_ROWS`, and one page past it when there are more.
 */
const pluginRows = async (orgId: string, row: ExportRow) => {
  const spec = await withOrg(orgId, (tx) => pluginTransfer(tx, row.recordType));
  const body: Cell[][] = [];
  let cursor: string | null = null;

  await repeatWhile(MAX_EXPORT_ROWS / PLUGIN_PAGE + 1, async () => {
    const page = await exportPage(spec, {
      orgId,
      userId: row.createdBy,
      columns: row.columns,
      query: row.query,
      cursor,
      limit: PLUGIN_PAGE,
    });

    body.push(
      ...page.rows
        .slice(0, PLUGIN_PAGE)
        .map((record) => row.columns.map((key) => customCell(record[key]))),
    );
    cursor = page.cursor;

    return cursor !== null && page.rows.length > 0 && body.length <= MAX_EXPORT_ROWS;
  });

  return body;
};

/** The export's file in memory, written to storage after it. */
const fileOf = async (row: ExportRow, header: string[], body: Cell[][]) => {
  const rows = body.slice(0, MAX_EXPORT_ROWS);
  const stamp = new Date().toISOString().slice(0, 10);

  const plural = isCoreType(row.recordType)
    ? { company: 'companies', lead: 'leads', customer: 'customers' }[row.recordType]
    : row.recordType.replace(':', '-');

  return {
    row,
    rowCount: rows.length,
    cut: body.length > MAX_EXPORT_ROWS,
    file: {
      name: `${plural}-${stamp}.${row.format}`,
      contentType:
        row.format === 'csv'
          ? 'text/csv'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: await exportFile(row.format, header, rows),
    },
  };
};

/** The running export, the member who asked and the file's header; null when it is no longer running. */
const runningExport = (orgId: string, exportId: string) =>
  withOrg(orgId, async (tx) => {
    const [row] = await tx.select().from(exports).where(eq(exports.id, exportId)).limit(1);

    if (!row || row.status !== 'running') return null;

    const member = await exporter(tx, row);

    if (!member) return null;

    const columns = await transferColumns(tx, row.recordType);

    return {
      member,
      row,
      header: row.columns.map((key) => columns.find((item) => item.key === key)?.label ?? key),
    };
  });

type BuiltExport = Awaited<ReturnType<typeof fileOf>>;

/** Marks the export done with its stored file and tells the member who asked. */
const finishExport = async (tx: Db, built: BuiltExport, fileId: string) => {
  const { row, rowCount, file } = built;

  await tx
    .update(exports)
    .set({ status: 'done', rowCount, fileId, finishedAt: sql`now()` })
    .where(eq(exports.id, row.id));
  // From core to the exporter: a notice from themselves would be skipped.
  await runAs(system('export ready'), () =>
    notify(tx, {
      userIds: [row.createdBy],
      kind: 'core.export.ready',
      title: `Your export is ready: ${rowCount.toLocaleString('en')} ${row.recordType === 'company' ? 'companies' : 'records'}`,
      body: built.cut
        ? `Only the first ${MAX_EXPORT_ROWS.toLocaleString('en')}: narrow the filter for the rest.`
        : file.name,
      link: `/contacts/settings/import-export?export=${row.id}`,
      entityType: 'export',
      entityId: row.id,
    }),
  ).catch((error: unknown) => log.warn({ err: error }, 'could not tell the exporter'));
};
