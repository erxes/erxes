import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { type ConditionGroup, createdAt, updatedAt } from './common';
import { organizations } from './organizations';

/** What an export reproduces: the list's filters as the member saw them. */
export interface ExportQuery {
  filter?: ConditionGroup | null;
  search?: string;
  tagIds?: string[];
  ownerId?: string;
}

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export const TRANSFER_RECORD_TYPES = ['customer', 'lead', 'company'] as const;

export const IMPORT_STATUSES = [
  'parsing',
  'mapping',
  'checking',
  'checked',
  'running',
  'done',
  'failed',
  'undone',
] as const;

export const EXPORT_STATUSES = ['running', 'done', 'failed'] as const;

export interface ImportOptions {
  /** `create`: new records only (existing ones skipped); `update`: existing only; `upsert`: both. */
  mode: 'create' | 'update' | 'upsert';
  /** How a row finds its existing record. */
  matchBy: 'email' | 'phone' | 'code' | 'id' | 'name';
  tagIds?: string[];
  ownerId?: string | null;
  /** Tags and companies named in the file but missing are created. */
  createMissing: boolean;
  /** Imported records start automations and notify owners (off: quiet). */
  runAutomations: boolean;
}

export interface ImportCounts {
  rows: number;
  create: number;
  update: number;
  skip: number;
  error: number;
}

/**
 * An import of customers, leads or companies from a CSV or Excel file: parsed
 * into rows, mapped to fields, checked (a dry run), then run in batches. The
 * records it created can be undone for 30 days.
 */
export const imports = pgTable(
  'imports',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    recordType: text({ enum: TRANSFER_RECORD_TYPES }).notNull(),
    fileId: text().notNull(),
    fileName: text().notNull(),
    status: text({ enum: IMPORT_STATUSES }).default('parsing').notNull(),
    headers: jsonb().$type<string[]>().default([]).notNull(),
    /** Column index (as text) → field key (`firstName`, `customFields.<id>`, `tags`, …); missing: ignored. */
    mapping: jsonb().$type<Record<string, string>>().default({}).notNull(),
    options: jsonb().$type<ImportOptions>().notNull(),
    counts: jsonb()
      .$type<ImportCounts>()
      .default({ rows: 0, create: 0, update: 0, skip: 0, error: 0 })
      .notNull(),
    /** Rows done while running (for progress and resuming). */
    processed: integer().default(0).notNull(),
    error: text(),
    createdBy: text().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    finishedAt: timestamptz(),
  },
  (table) => [
    index('core_imports_org_created_idx').on(table.orgId, table.createdAt.desc()),
    uniqueIndex('core_imports_org_id_id_key').on(table.orgId, table.id),
    check(
      'core_imports_record_type_check',
      sql`${table.recordType} IN ('customer', 'lead', 'company')`,
    ),
    check(
      'core_imports_status_check',
      sql`${table.status} IN ('parsing', 'mapping', 'checking', 'checked', 'running', 'done', 'failed', 'undone')`,
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_imports_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/** One row of an import's file: its cells, what the check said, what running it did. */
export const importRows = pgTable(
  'import_rows',
  {
    orgId: text().notNull(),
    importId: text().notNull(),
    /** 1-based, after the header (as people count rows in a spreadsheet: row 2 is the first). */
    rowNumber: integer().notNull(),
    cells: jsonb().$type<string[]>().notNull(),
    /** From the check, then the run: `create`, `update`, `skip` or `error`. */
    action: text(),
    error: text(),
    recordId: text(),
  },
  (table) => [
    primaryKey({ columns: [table.importId, table.rowNumber], name: 'core_import_rows_pkey' }),
    index('core_import_rows_action_idx').on(table.importId, table.action),
    foreignKey({
      columns: [table.orgId, table.importId],
      foreignColumns: [imports.orgId, imports.id],
      name: 'core_import_rows_import_fkey',
    }).onDelete('cascade'),
  ],
);

/** An export of a list (its filter, search, view) to CSV or Excel, made in the background. */
export const exports = pgTable(
  'exports',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    recordType: text({ enum: TRANSFER_RECORD_TYPES }).notNull(),
    format: text({ enum: ['csv', 'xlsx'] }).notNull(),
    /** The list query: `filter` (condition group), `search`, `tagIds`, `ownerId`. */
    query: jsonb().$type<ExportQuery>().default({}).notNull(),
    columns: jsonb().$type<string[]>().notNull(),
    status: text({ enum: EXPORT_STATUSES }).default('running').notNull(),
    rowCount: integer(),
    fileId: text(),
    error: text(),
    createdBy: text().notNull(),
    createdAt: createdAt(),
    finishedAt: timestamptz(),
  },
  (table) => [
    index('core_exports_org_created_idx').on(table.orgId, table.createdAt.desc()),
    check(
      'core_exports_record_type_check',
      sql`${table.recordType} IN ('customer', 'lead', 'company')`,
    ),
    check('core_exports_format_check', sql`${table.format} IN ('csv', 'xlsx')`),
    check('core_exports_status_check', sql`${table.status} IN ('running', 'done', 'failed')`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_exports_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
