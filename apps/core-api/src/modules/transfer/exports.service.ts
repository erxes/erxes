import type { Export, TransferRecordType } from '@erxes/core-contract';
import {
  companies,
  companyTags,
  customerCompanies,
  customers,
  customerTags,
  type Db,
  exports,
  newId,
  tags,
  type Transaction,
  users,
} from '@erxes/core-db';
import { and, asc, eq, getTableColumns, gt, inArray, sql } from 'drizzle-orm';
import { stringify } from 'csv-stringify/sync';
import writeXlsxFile from 'write-excel-file/node';
import { type Actor, type Caller, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { log } from '~/lib/log';
import { recordAudit } from '~/modules/audit/audit.service';
import { companyListWhere } from '~/modules/companies/companies.service';
import { customerListWhere } from '~/modules/customers/customers.service';
import { storeServerFile } from '~/modules/files/files.service';
import { enqueueJob, type JobDefinition } from '~/modules/jobs/jobs';
import { notify } from '~/modules/notifications/notifications.service';
import { customCell, transferColumns } from './columns';
import { customFieldsColumn } from '~/modules/fields/fieldValues';

type ExportRow = typeof exports.$inferSelect;

/** At most this many rows per export (narrow the filter for more). */
export const MAX_EXPORT_ROWS = 100_000;
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

export const listExports = async (client: Db, actor: Actor) => ({
  data: (
    await client
      .select()
      .from(exports)
      .where(eq(exports.orgId, actor.orgId))
      .orderBy(sql`${exports.createdAt} desc`)
      .limit(50)
  ).map(toDto),
});

type Query = { filter?: unknown; search?: string; tagIds?: string[]; ownerId?: string };

/** The list's conditions, exactly as the list shows them (leads are customers in the lead state). */
const whereOf = (client: Db, actor: Actor, recordType: TransferRecordType, query: Query) => {
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

/** Starts an export of a list in the background; the member is told when the file is ready. */
export const createExport = async (
  client: Db,
  actor: Actor,
  input: {
    recordType: TransferRecordType;
    format: 'csv' | 'xlsx';
    columns: string[];
    query: Query;
  },
) => {
  const available = await transferColumns(client, actor.orgId, input.recordType);

  const unknown = input.columns.find(
    (key) => !available.some((item) => item.key === key && item.exportable),
  );

  if (unknown) throw new HttpError(400, 'INVALID_COLUMNS', `Unknown column: ${unknown}`);

  // A filter that doesn't fit is refused now, not in the background.
  await whereOf(client, actor, input.recordType, input.query);

  const [row] = await client
    .insert(exports)
    .values({
      id: newId(),
      orgId: actor.orgId,
      recordType: input.recordType,
      format: input.format,
      columns: input.columns,
      query: input.query as Record<string, unknown>,
      createdBy: actor.userId,
    })
    .returning();

  await enqueueJob(client, {
    orgId: actor.orgId,
    queue: 'export.run',
    payload: { exportId: row!.id },
    maxAttempts: 3,
  });
  // Contacts leaving erxes: always in the audit log.
  await recordAudit(client, userCaller(actor), {
    action: 'contacts.exported',
    targetType: 'export',
    targetId: row!.id,
    targetLabel: input.recordType,
    metadata: { format: input.format, columns: input.columns, query: input.query },
  });

  return toDto(row!);
};

/** Spreadsheets run cells starting with = + - @ as formulas: such text is kept as text. */
const defuse = (value: string) => (/^[=+\-@\t\r]/.test(value) ? `'${value}` : value);

type Cell = string | number | Date | null;

/** The cells of one page of records, in the chosen columns' order. */
const pageCells = async (
  tx: Db,
  orgId: string,
  recordType: TransferRecordType,
  rows: Record<string, unknown>[],
  keys: string[],
): Promise<Cell[][]> => {
  const isCompany = recordType === 'company';
  const ids = rows.map((row) => String(row.id));
  const links = isCompany ? companyTags : customerTags;

  const tagRows =
    keys.includes('tags') && ids.length
      ? await tx
          .select({ recordId: links.recordId, name: tags.name })
          .from(links)
          .innerJoin(tags, eq(tags.id, links.tagId))
          .where(and(eq(links.orgId, orgId), inArray(links.recordId, ids)))
      : [];

  const ownerIds = [
    ...new Set(rows.map((row) => row.ownerId).filter((id): id is string => typeof id === 'string')),
  ];

  const owners = new Map(
    keys.includes('owner') && ownerIds.length
      ? (
          await tx
            .select({ id: users.id, email: users.email })
            .from(users)
            .where(and(eq(users.orgId, orgId), inArray(users.id, ownerIds)))
        ).map((user) => [user.id, user.email] as const)
      : [],
  );

  const companyRows =
    !isCompany && keys.includes('companies') && ids.length
      ? await tx
          .select({ customerId: customerCompanies.customerId, name: companies.primaryName })
          .from(customerCompanies)
          .innerJoin(companies, eq(companies.id, customerCompanies.companyId))
          .where(
            and(eq(customerCompanies.orgId, orgId), inArray(customerCompanies.customerId, ids)),
          )
      : [];

  const customerCounts = new Map(
    isCompany && keys.includes('customerCount') && ids.length
      ? (
          await tx
            .select({ companyId: customerCompanies.companyId, count: sql<number>`count(*)::int` })
            .from(customerCompanies)
            .where(
              and(eq(customerCompanies.orgId, orgId), inArray(customerCompanies.companyId, ids)),
            )
            .groupBy(customerCompanies.companyId)
        ).map((item) => [item.companyId, item.count] as const)
      : [],
  );

  const listOf = (items: { key: string; name: string }[], id: string) =>
    items
      .filter((item) => item.key === id)
      .map((item) => item.name)
      .join('; ');

  return rows.map((row) =>
    keys.map((key): Cell => {
      const id = String(row.id);

      if (key.startsWith('customFields.'))
        return customCell(
          (row.customFields as Record<string, unknown>)[key.slice('customFields.'.length)],
        );

      if (key === 'tags')
        return listOf(
          tagRows.map((item) => ({ key: item.recordId, name: item.name })),
          id,
        );

      if (key === 'owner')
        return typeof row.ownerId === 'string' ? (owners.get(row.ownerId) ?? '') : '';

      if (key === 'companies')
        return listOf(
          companyRows.map((item) => ({ key: item.customerId, name: item.name })),
          id,
        );

      if (key === 'customerCount') return customerCounts.get(id) ?? 0;

      if (key === 'emails' || key === 'phones' || key === 'names')
        return Array.isArray(row[key]) ? (row[key] as string[]).join('; ') : '';

      const value = row[key];

      if (value instanceof Date) return value;

      if (typeof value === 'number') return value;

      return value === null || value === undefined ? '' : String(value);
    }),
  );
};

/** Pages through the list (by id, so nothing is missed or repeated), writes the file, tells the member. */
export const exportRunJob: JobDefinition = {
  queue: 'export.run',
  leaseSeconds: 900,
  async handle(job) {
    const { withOrg } = await import('@erxes/core-db');

    await withOrg(job.orgId, async (tx: Transaction) => {
      const [row] = await tx
        .select()
        .from(exports)
        .where(and(eq(exports.orgId, job.orgId), eq(exports.id, job.payload.exportId as string)))
        .limit(1);

      if (!row || row.status !== 'running') return;

      const [member] = await tx
        .select({ id: users.id, role: users.role, status: users.status })
        .from(users)
        .where(and(eq(users.orgId, job.orgId), eq(users.id, row.createdBy)))
        .limit(1);

      if (!member || member.status !== 'active') {
        await tx
          .update(exports)
          .set({
            status: 'failed',
            error: 'The member who asked is no longer active',
            finishedAt: sql`now()`,
          })
          .where(eq(exports.id, row.id));

        return;
      }

      // Their permissions don't matter for the conditions (`me` does): the export was allowed when asked.
      const actor: Actor = {
        userId: member.id,
        orgId: job.orgId,
        role: member.role,
        permissions: [],
      };

      const where = await whereOf(tx, actor, row.recordType, row.query);
      const table = row.recordType === 'company' ? companies : customers;
      const columns = await transferColumns(tx, job.orgId, row.recordType);

      const header = row.columns.map(
        (key) => columns.find((item) => item.key === key)?.label ?? key,
      );

      const body: Cell[][] = [];
      let last = '';

      while (body.length < MAX_EXPORT_ROWS) {
        const page = (await tx
          .select({
            ...getTableColumns(table),
            customFields: customFieldsColumn(
              row.recordType === 'company' ? 'company' : 'customer',
              table.id,
            ),
          })
          .from(table)
          .where(and(eq(table.orgId, job.orgId), where, last ? gt(table.id, last) : undefined))
          .orderBy(asc(table.id))
          .limit(PAGE)) as unknown as Record<string, unknown>[];

        if (!page.length) break;

        body.push(...(await pageCells(tx, job.orgId, row.recordType, page, row.columns)));
        last = String(page.at(-1)!.id);

        if (page.length < PAGE) break;
      }

      const rows = body.slice(0, MAX_EXPORT_ROWS);
      const stamp = new Date().toISOString().slice(0, 10);
      const name = `${row.recordType === 'company' ? 'companies' : row.recordType === 'lead' ? 'leads' : 'customers'}-${stamp}.${row.format}`;

      const file =
        row.format === 'csv'
          ? Buffer.concat([
              // A BOM: Excel then reads UTF-8 (Mongolian) correctly.
              Buffer.from('﻿'),
              Buffer.from(
                stringify([
                  header,
                  ...rows.map((cells) =>
                    cells.map((cell) =>
                      cell instanceof Date ? cell.toISOString() : defuse(String(cell ?? '')),
                    ),
                  ),
                ]),
              ),
            ])
          : await writeXlsxFile(
              [
                header.map((value) => ({ value, fontWeight: 'bold' as const })),
                ...rows.map((cells) =>
                  cells.map((cell) =>
                    cell instanceof Date
                      ? { value: cell, type: Date, format: 'yyyy-mm-dd hh:mm' }
                      : typeof cell === 'number'
                        ? { value: cell, type: Number }
                        : { value: String(cell ?? ''), type: String },
                  ),
                ),
              ],
              { stickyRowsCount: 1 },
            ).toBuffer();

      const caller: Caller = userCaller(actor);

      const stored = await storeServerFile(tx, caller, {
        name,
        contentType:
          row.format === 'csv'
            ? 'text/csv'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: file,
      });

      await tx
        .update(exports)
        .set({ status: 'done', rowCount: rows.length, fileId: stored.id, finishedAt: sql`now()` })
        .where(eq(exports.id, row.id));
      await notify(
        tx,
        {
          orgId: job.orgId,
          actorType: 'system',
          actorId: null,
          source: 'core',
        } as unknown as Caller,
        {
          userIds: [row.createdBy],
          kind: 'core.export.ready',
          title: `Your export is ready: ${rows.length.toLocaleString('en')} ${row.recordType === 'company' ? 'companies' : 'records'}`,
          body:
            body.length > MAX_EXPORT_ROWS
              ? `Only the first ${MAX_EXPORT_ROWS.toLocaleString('en')}: narrow the filter for the rest.`
              : name,
          link: `/contacts/settings/import-export?export=${row.id}`,
          entity: { type: 'export', id: row.id },
        },
      ).catch((error: unknown) => log.warn('could not tell the exporter', { error }));
    });
  },
  async onDead(job, error, tx) {
    await tx
      .update(exports)
      .set({ status: 'failed', error: error.slice(0, 500), finishedAt: sql`now()` })
      .where(eq(exports.id, job.payload.exportId as string));
  },
};

export const exportOrThrow = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(exports)
    .where(and(eq(exports.orgId, orgId), eq(exports.id, id)))
    .limit(1);

  if (!row) throw notFound('Export');

  return toDto(row);
};
