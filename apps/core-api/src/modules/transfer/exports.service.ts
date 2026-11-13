import type { EXPORT_FORMATS } from '@erxes/core-db/enums';
import type { CursorQuery, Export, ExportQuery, TransferRecordType } from '@erxes/core-contract';
import { companies, customers, type Db, exports, newId, users, withOrg } from '@erxes/core-db';
import { and, asc, eq, getTableColumns, gt, type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { type Actor, systemCaller, userCaller } from '~/http/auth';
import { HttpError } from '~/http/errors';
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
import { transferColumns } from './columns';
import { type Cell, type ExportRecord, exportFile, pageCells } from './exportCells';

const log = logger.child({ component: 'exports' });

type ExportRow = typeof exports.$inferSelect;

/** At most this many rows per export (narrow the filter for more). */
const MAX_EXPORT_ROWS = 100_000;
const PAGE = 1000;

const toDto = (row: ExportRow): Export => ({
  id: row.id,
  recordType: row.recordType,
  format: row.format,
  columns: row.columns,
  status: row.status,
  rowCount: row.rowCount,
  fileId: row.fileId,
  error: row.error,
  createdBy: row.createdBy,
  createdAt: row.createdAt.toISOString(),
  finishedAt: row.finishedAt?.toISOString() ?? null,
});

export const listExports = async (client: Db, query: CursorQuery) => {
  const page = await keysetPage(
    client,
    {
      table: exports,
      id: exports.id,
      createdAt: exports.createdAt,
    },
    undefined,
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(exports)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: page.data.map(toDto) };
};

/** The list's conditions, exactly as the list shows them (leads are customers in the lead state). */
const whereOf = (client: Db, actor: Actor, recordType: TransferRecordType, query: ExportQuery) => {
  const common = {
    search: query.search,
    tagIds: query.tagIds,
    ownerId: query.ownerId,
    filter: query.filter ? JSON.stringify(query.filter) : undefined,
  };

  return recordType === 'company'
    ? companyListWhere(client, actor, common)
    : customerListWhere(client, actor, {
        ...common,
        state: recordType === 'lead' ? 'lead' : 'customer',
      });
};

/**
 * Pages through the list (by id, so nothing is missed or repeated), writes the
 * file to storage outside any scope, then marks the export done and tells the member.
 */
export const exportRunJob = defineJob({
  queue: 'export.run',
  leaseSeconds: 900,
  payload: z.object({ exportId: z.string() }),
  async handle(job) {
    const built = await prepareExport(job.orgId, job.payload.exportId);

    if (!built) return;

    const stored = await storeServerFile(userCaller(built.actor), built.file);

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
export const createExport = async (
  client: Db,
  actor: Actor,
  input: {
    recordType: TransferRecordType;
    format: (typeof EXPORT_FORMATS)[number];
    columns: string[];
    query: ExportQuery;
  },
) => {
  const available = await transferColumns(client, input.recordType);

  const unknown = input.columns.find(
    (key) => !available.some((item) => item.key === key && item.exportable),
  );

  if (unknown) throw new HttpError(400, 'INVALID_COLUMNS', `Unknown column: ${unknown}`);

  // A filter that doesn't fit is refused now, not in the background.
  await whereOf(client, actor, input.recordType, input.query);

  const row = oneRow(
    await client
      .insert(exports)
      .values({
        id: newId(),
        recordType: input.recordType,
        format: input.format,
        columns: input.columns,
        query: input.query,
        createdBy: actor.userId,
      })
      .returning(),
  );

  await exportRunJob.enqueue(client, {
    orgId: actor.orgId,
    payload: { exportId: row.id },
    maxAttempts: 3,
  });
  // Contacts leaving erxes: always in the audit log.
  await recordAudit(client, userCaller(actor), {
    action: 'contacts.exported',
    targetType: 'export',
    targetId: row.id,
    targetLabel: input.recordType,
    metadata: { format: input.format, columns: input.columns, query: input.query },
  });

  return toDto(row);
};

/** The member who asked, or null (and the export failed) when they are no longer active. */
const exporter = async (tx: Db, row: ExportRow): Promise<Actor | null> => {
  const [member] = await tx
    .select({ id: users.id, role: users.role, status: users.status })
    .from(users)
    .where(eq(users.id, row.createdBy))
    .limit(1);

  if (member?.status === 'active') {
    // Their permissions don't matter for the conditions (`me` does): the export was allowed when asked.
    return { userId: member.id, orgId: row.orgId, role: member.role, permissions: [] };
  }

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
  row: ExportRow,
  where: SQL | undefined,
  last: string,
): Promise<ExportRecord[]> => {
  if (row.recordType === 'company') {
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
const collectRows = async (tx: Db, actor: Actor, row: ExportRow) => {
  const where = await whereOf(tx, actor, row.recordType, row.query);
  const body: Cell[][] = [];
  let last = '';

  // Page after page until a short one, or one page past the limit.
  await repeatWhile(MAX_EXPORT_ROWS / PAGE + 1, async () => {
    const page = await pageOf(tx, row, where, last);
    const end = page.at(-1);

    if (!end) return false;

    body.push(...(await pageCells(tx, row.recordType, page, row.columns)));
    last = end.id;

    return page.length === PAGE && body.length <= MAX_EXPORT_ROWS;
  });

  return body;
};

/** The export's file in memory: its rows read in one scope, written to storage after it. */
const buildExport = async (tx: Db, actor: Actor, row: ExportRow) => {
  const columns = await transferColumns(tx, row.recordType);
  const header = row.columns.map((key) => columns.find((item) => item.key === key)?.label ?? key);
  const body = await collectRows(tx, actor, row);
  const rows = body.slice(0, MAX_EXPORT_ROWS);
  const stamp = new Date().toISOString().slice(0, 10);
  const plural = { company: 'companies', lead: 'leads', customer: 'customers' }[row.recordType];

  return {
    actor,
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

/** The running export and its file, or null when it is no longer running. */
const prepareExport = (orgId: string, exportId: string) =>
  withOrg(orgId, async (tx) => {
    const [row] = await tx.select().from(exports).where(eq(exports.id, exportId)).limit(1);

    if (!row || row.status !== 'running') return null;

    const actor = await exporter(tx, row);

    return actor ? buildExport(tx, actor, row) : null;
  });

type BuiltExport = Awaited<ReturnType<typeof buildExport>>;

/** Marks the export done with its stored file and tells the member who asked. */
const finishExport = async (tx: Db, built: BuiltExport, fileId: string) => {
  const { row, rowCount, file } = built;

  await tx
    .update(exports)
    .set({ status: 'done', rowCount, fileId, finishedAt: sql`now()` })
    .where(eq(exports.id, row.id));
  await notify(tx, systemCaller(row.orgId), {
    userIds: [row.createdBy],
    kind: 'core.export.ready',
    title: `Your export is ready: ${rowCount.toLocaleString('en')} ${row.recordType === 'company' ? 'companies' : 'records'}`,
    body: built.cut
      ? `Only the first ${MAX_EXPORT_ROWS.toLocaleString('en')}: narrow the filter for the rest.`
      : file.name,
    link: `/contacts/settings/import-export?export=${row.id}`,
    entity: { type: 'export', id: row.id },
  }).catch((error: unknown) => log.warn({ err: error }, 'could not tell the exporter'));
};
