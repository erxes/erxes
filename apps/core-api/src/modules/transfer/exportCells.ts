import type { EXPORT_FORMATS } from '@erxes/core-db/enums';
import type { TransferRecordType } from '@erxes/core-contract';
import {
  companies,
  companyTags,
  customerCompanies,
  customerTags,
  type CustomValue,
  type Db,
  tags,
  users,
} from '@erxes/core-db';
import { stringify } from 'csv-stringify/sync';
import { and, eq, inArray, sql } from 'drizzle-orm';
import writeXlsxFile from 'write-excel-file/node';
import { defuse } from '~/lib/csv';
import { customCell } from './columns';

export type Cell = string | number | Date | null;

/** A customer or company row as the export reads it: its columns and its custom field values. */
export interface ExportRecord {
  id: string;
  ownerId: string | null;
  customFields: Record<string, CustomValue>;
  [column: string]: unknown;
}

/** Names per record (`; `-joined): its tags or its companies. */
type Names = Map<string, string[]>;

const namesOf = (rows: { recordId: string; name: string }[]): Names => {
  const names: Names = new Map();

  for (const row of rows) names.set(row.recordId, [...(names.get(row.recordId) ?? []), row.name]);

  return names;
};

/** What the chosen relation columns need for one page: tags, owners' emails, companies, customer counts. */
const relationsOf = async (
  tx: Db,
  orgId: string,
  isCompany: boolean,
  rows: ExportRecord[],
  keys: string[],
) => {
  const ids = rows.map((row) => row.id);
  const links = isCompany ? companyTags : customerTags;
  const ownerIds = [...new Set(rows.flatMap((row) => (row.ownerId ? [row.ownerId] : [])))];
  const wants = (key: string) => keys.includes(key) && ids.length > 0;

  const tagRows = wants('tags')
    ? await tx
        .select({ recordId: links.recordId, name: tags.name })
        .from(links)
        .innerJoin(tags, eq(tags.id, links.tagId))
        .where(and(eq(links.orgId, orgId), inArray(links.recordId, ids)))
    : [];

  const owners =
    wants('owner') && ownerIds.length
      ? await tx
          .select({ id: users.id, email: users.email })
          .from(users)
          .where(and(eq(users.orgId, orgId), inArray(users.id, ownerIds)))
      : [];

  const companyRows =
    !isCompany && wants('companies')
      ? await tx
          .select({ recordId: customerCompanies.customerId, name: companies.primaryName })
          .from(customerCompanies)
          .innerJoin(companies, eq(companies.id, customerCompanies.companyId))
          .where(
            and(eq(customerCompanies.orgId, orgId), inArray(customerCompanies.customerId, ids)),
          )
      : [];

  const counts =
    isCompany && wants('customerCount')
      ? await tx
          .select({ companyId: customerCompanies.companyId, count: sql<number>`count(*)::int` })
          .from(customerCompanies)
          .where(and(eq(customerCompanies.orgId, orgId), inArray(customerCompanies.companyId, ids)))
          .groupBy(customerCompanies.companyId)
      : [];

  return {
    tags: namesOf(tagRows),
    owners: new Map(owners.map((user) => [user.id, user.email])),
    companies: namesOf(companyRows),
    customerCounts: new Map(counts.map((item) => [item.companyId, item.count])),
  };
};

/** A plain column's value as a cell. */
const plainCell = (value: unknown): Cell => {
  if (value instanceof Date || typeof value === 'number' || typeof value === 'string') return value;

  if (value === null || value === undefined) return '';

  if (Array.isArray(value)) return value.join('; ');

  return typeof value === 'boolean' ? String(value) : JSON.stringify(value);
};

/** The cells of one page of records, in the chosen columns' order. */
export const pageCells = async (
  tx: Db,
  orgId: string,
  recordType: TransferRecordType,
  rows: ExportRecord[],
  keys: string[],
): Promise<Cell[][]> => {
  const relations = await relationsOf(tx, orgId, recordType === 'company', rows, keys);

  return rows.map((row) =>
    keys.map((key): Cell => {
      if (key.startsWith('customFields.'))
        return customCell(row.customFields[key.slice('customFields.'.length)]);

      if (key === 'tags') return (relations.tags.get(row.id) ?? []).join('; ');

      if (key === 'owner') return row.ownerId ? (relations.owners.get(row.ownerId) ?? '') : '';

      if (key === 'companies') return (relations.companies.get(row.id) ?? []).join('; ');

      if (key === 'customerCount') return relations.customerCounts.get(row.id) ?? 0;

      return plainCell(row[key]);
    }),
  );
};

/** The export file: CSV (UTF-8 with a BOM) or Excel with a bold, sticky header. */
export const exportFile = async (
  format: (typeof EXPORT_FORMATS)[number],
  header: string[],
  rows: Cell[][],
) => {
  if (format === 'csv') {
    const lines = rows.map((cells) =>
      cells.map((cell) => (cell instanceof Date ? cell.toISOString() : defuse(String(cell ?? '')))),
    );

    // A BOM: Excel then reads UTF-8 (Mongolian) correctly.
    return Buffer.concat([Buffer.from('﻿'), Buffer.from(stringify([header, ...lines]))]);
  }

  return writeXlsxFile(
    [
      header.map((value) => ({ value, fontWeight: 'bold' as const })),
      ...rows.map((cells) =>
        cells.map((cell) =>
          cell instanceof Date
            ? { value: cell, type: Date, format: 'yyyy-mm-dd hh:mm' }
            : typeof cell === 'number'
              ? { value: cell, type: Number }
              : { value: cell ?? '', type: String },
        ),
      ),
    ],
    { stickyRowsCount: 1 },
  ).toBuffer();
};
