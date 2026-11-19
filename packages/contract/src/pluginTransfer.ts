import { IMPORT_MODES, IMPORT_ROW_ACTIONS } from '@erxes/core-db/enums';
import { z } from 'zod';
import { ExportQuery } from './transfer';
import { PluginListType, RoleReach } from './values';

/** A column of a plugin's records: what an import can fill and an export writes. */
const PluginTransferColumn = z.object({
  key: z
    .string()
    .regex(/^[a-zA-Z][a-zA-Z0-9_.]{0,59}$/, 'letters, digits, _ and . (starting with a letter)'),
  label: z.string().trim().min(1).max(100),
  importable: z.boolean().default(true),
  exportable: z.boolean().default(true),
  /** Exported unless the member unticks it. */
  default: z.boolean().default(true),
  /** Other header names that mean this column, for suggesting the mapping (`title`, `гарчиг`). */
  aliases: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
});

const PluginTransfer = z.object({
  /** `<plugin>:<record>` (`frontline:ticket`), the record type imports and exports carry. */
  type: PluginListType,
  /** What the records are called in a list (`Tickets`). */
  label: z.string().trim().min(1).max(100),
  /** The plugin's permission that lets a member export them (`frontline.ticket.export`). */
  exportPermission: z.string().trim().min(1).max(100),
  /** The plugin's permission that lets a member import them (`frontline.ticket.import`). */
  importPermission: z.string().trim().min(1).max(100),
  columns: z
    .array(PluginTransferColumn)
    .min(1)
    .max(200)
    .refine(
      (columns) => new Set(columns.map((column) => column.key)).size === columns.length,
      'each column key once',
    ),
});

/**
 * The manifest's `transfer`: its record types members import from CSV or Excel and export to
 * them, through core's import and export (the file, the mapping, the check, the jobs, the
 * progress and the history). Core asks the plugin's API for the rows: a page to export at
 * `<api.url>/transfer/export`, a batch to check or write at `<api.url>/transfer/import`.
 */
export const PluginTransfers = z
  .array(PluginTransfer)
  .max(20)
  .refine((list) => new Set(list.map((item) => item.type)).size === list.length, 'each type once');

const Request = z.object({
  /** Signed into core's token; also the `Idempotency-Key` header. */
  requestId: z.string(),
  orgId: z.string(),
  /** The member who asked: answer with what they may see and change. */
  userId: z.string(),
  /** How far the member's role reaches, and the units they are in: answer within it (`withinReach`). */
  reach: RoleReach,
  unitIds: z.array(z.string()),
  /** A type the manifest's `transfer` declares (`frontline:ticket`). */
  type: PluginListType,
});

/** What core POSTs to `<api.url>/transfer/export`: the next page of the records to export. */
export const PluginExportRequest = Request.extend({
  kind: z.literal('export'),
  /** The keys of the columns to fill, in the file's order. */
  columns: z.array(z.string()),
  /** The list's filters as the member set them (`filter`, `search`); apply what your list applies. */
  query: ExportQuery,
  /** Where the last page ended (your answer's `cursor`); null on the first page. */
  cursor: z.string().nullable(),
  /** The most rows to answer with. */
  limit: z.int().min(1),
});

/** What core POSTs to `<api.url>/transfer/import`: a batch of the file's rows, keyed by column. */
export const PluginImportRequest = Request.extend({
  kind: z.literal('import'),
  importId: z.string(),
  /** A check: answer what each row would do, and change nothing. */
  dryRun: z.boolean(),
  /** Rows that match an existing record: `create` skips them, `update` creates nothing, `upsert` both. */
  mode: z.enum(IMPORT_MODES),
  /** Each row's non-empty mapped cells, trimmed, by column key; `rowNumber` as the spreadsheet counts. */
  rows: z.array(z.object({ rowNumber: z.int(), values: z.record(z.string(), z.string()) })),
});

/** A request core POSTs to a plugin's `/transfer/*` routes (`verifyCoreTransfer`). */
export const PluginTransferRequest = z.discriminatedUnion('kind', [
  PluginExportRequest,
  PluginImportRequest,
]);

export type PluginTransferRequest = z.infer<typeof PluginTransferRequest>;

/** One exported cell: a list is written `; `-joined, true and false as yes and no. */
const ExportValue = z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.string())]);

/** The answer to an export request: at most `limit` rows by column key, and where the next page starts. */
export const PluginExportPage = z.object({
  rows: z.array(z.record(z.string(), ExportValue)),
  /** null: this was the last page. */
  cursor: z.string().nullable(),
});

/** The answer to an import request: what each row did (or, in a check, would do). */
export const PluginImportResult = z.object({
  rows: z.array(
    z.object({
      rowNumber: z.int(),
      action: z.enum(IMPORT_ROW_ACTIONS),
      /** The record created or updated. */
      recordId: z.string().max(64).optional(),
      /** Why the row failed, for the member's error report. */
      error: z.string().optional(),
    }),
  ),
});

export type PluginImportResult = z.infer<typeof PluginImportResult>;
