import {
  EXPORT_FORMATS,
  IMPORT_MATCH_KEYS,
  IMPORT_MODES,
  IMPORT_ROW_ACTIONS,
  IMPORT_STATUSES,
  TRANSFER_FIELD_GROUPS,
  TRANSFER_RECORD_TYPES,
} from '@erxes/core-db/enums';
import { exports, importRows, imports } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { ConditionGroup } from '@erxes/core-db/automationDefinition';
import { CursorQuery, cursorPageOf, Id, isoDate, listOf } from './common';

export const TransferRecordType = z.enum(TRANSFER_RECORD_TYPES);

export type TransferRecordType = z.infer<typeof TransferRecordType>;

/** A page of imports or exports: 50, the most the lists showed before they paged. */
const TransferPage = CursorQuery.extend({
  limit: z.coerce.number().int().min(1).max(100).default(50),
}).prefault({});

/** A column imports map to and exports write: built-in fields, properties (`customFields.<id>`), tags, owner, companies. */
export const TransferColumn = z.object({
  key: z.string(),
  label: z.string(),
  group: z.enum(TRANSFER_FIELD_GROUPS),
  importable: z.boolean(),
  exportable: z.boolean(),
  /** Exported unless the member unticks it. */
  default: z.boolean(),
});

export type TransferColumn = z.infer<typeof TransferColumn>;

/**
 * No zod defaults: the server sets them when it creates an import, and `updateImport`
 * takes `.partial()` of this, where a default would overwrite the stored option.
 */
export const ImportOptions = z.object({
  mode: z.enum(IMPORT_MODES),
  matchBy: z.enum(IMPORT_MATCH_KEYS),
  tagIds: z.array(Id).max(50).optional(),
  ownerId: Id.nullable().optional(),
  createMissing: z.boolean(),
  runAutomations: z.boolean(),
});

export type ImportOptions = z.infer<typeof ImportOptions>;

export const ImportStatus = z.enum(IMPORT_STATUSES);

const Counts = z.object({
  rows: z.int(),
  create: z.int(),
  update: z.int(),
  skip: z.int(),
  error: z.int(),
});

const strings = () => z.array(z.string());

export const Import = createSelectSchema(imports, {
  id: Id,
  headers: strings,
  mapping: z.record(z.string(), z.string()),
  options: ImportOptions,
  counts: Counts,
  processed: () => z.int(),
  createdBy: Id,
  createdAt: isoDate,
  finishedAt: isoDate,
})
  .pick({
    id: true,
    recordType: true,
    fileName: true,
    status: true,
    headers: true,
    /** Column index → field key; unmapped columns are ignored. */
    mapping: true,
    options: true,
    counts: true,
    processed: true,
    error: true,
    createdBy: true,
    createdAt: true,
    finishedAt: true,
  })
  .extend({
    /** The first rows, to check the mapping against. */
    sample: z.array(z.array(z.string())),
    /** Its created records can still be removed (30 days). */
    undoable: z.boolean(),
  });

export type Import = z.infer<typeof Import>;

export const ImportRow = createSelectSchema(importRows, {
  rowNumber: () => z.int(),
  cells: strings,
  action: () => z.enum(IMPORT_ROW_ACTIONS),
}).pick({ rowNumber: true, cells: true, action: true, error: true, recordId: true });

/** What an export reproduces: the list's filters as the member sees them. */
export const ExportQuery = z.object({
  filter: ConditionGroup.nullable().optional(),
  search: z.string().trim().max(100).optional(),
  tagIds: z.array(Id).max(50).optional(),
  ownerId: Id.optional(),
});

export type ExportQuery = z.infer<typeof ExportQuery>;

export const Export = createSelectSchema(exports, {
  id: Id,
  columns: strings,
  rowCount: () => z.int(),
  fileId: () => Id,
  createdBy: Id,
  createdAt: isoDate,
  finishedAt: isoDate,
}).pick({
  id: true,
  recordType: true,
  format: true,
  columns: true,
  status: true,
  rowCount: true,
  /** The file (download at `/files/{fileId}/download`). */
  fileId: true,
  error: true,
  createdBy: true,
  createdAt: true,
  finishedAt: true,
});

export type Export = z.infer<typeof Export>;

/** Imports from CSV or Excel (mapped, checked, run in the background, undoable) and exports of lists. */
const {
  CROSS_SITE,
  IMPORT_LOCKED,
  INVALID_COLUMNS,
  INVALID_MAPPING,
  INVALID_OPTIONS,
  INVALID_RECIPIENT,
  INVALID_TAG,
  LIMIT_EXCEEDED,
  NOT_UNDOABLE,
  TAG_LIMIT,
  UNSUPPORTED_FILE,
  UPLOAD_CHANGED,
  UPLOAD_INCOMPLETE,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  CROSS_SITE,
  IMPORT_LOCKED,
  INVALID_COLUMNS,
  INVALID_MAPPING,
  INVALID_OPTIONS,
  INVALID_RECIPIENT,
  INVALID_TAG,
  LIMIT_EXCEEDED,
  NOT_UNDOABLE,
  TAG_LIMIT,
  UNSUPPORTED_FILE,
  UPLOAD_CHANGED,
  UPLOAD_INCOMPLETE,
});

export const transferContract = {
  columns: base
    .route({
      method: 'GET',
      path: '/transfer/columns',
      summary: 'What imports can fill and exports can write, for a record type',
    })
    .input(z.object({ recordType: TransferRecordType }))
    .output(listOf(TransferColumn)),
  imports: base
    .route({ method: 'GET', path: '/imports', summary: 'Imports, newest first' })
    .input(TransferPage)
    .output(cursorPageOf(Import)),
  import: base
    .route({ method: 'GET', path: '/imports/{id}' })
    .input(z.object({ id: Id }))
    .output(Import),
  createImport: base
    .route({
      method: 'POST',
      path: '/imports',
      successStatus: 201,
      summary:
        'Start an import from an uploaded CSV or Excel file (≤ 100,000 rows): it is read, then columns are suggested',
    })
    .input(z.object({ recordType: TransferRecordType, fileId: Id }))
    .output(Import),
  updateImport: base
    .route({
      method: 'PATCH',
      path: '/imports/{id}',
      summary: 'Set the column mapping and options (before it runs); the check result is cleared',
    })
    .input(
      z.object({
        id: Id,
        mapping: z.record(z.string(), z.string()).optional(),
        options: ImportOptions.partial().optional(),
      }),
    )
    .output(Import),
  checkImport: base
    .route({
      method: 'POST',
      path: '/imports/{id}/check',
      summary: 'A dry run: what each row would do (create, update, skip, error), changing nothing',
    })
    .input(z.object({ id: Id }))
    .output(Import),
  startImport: base
    .route({
      method: 'POST',
      path: '/imports/{id}/start',
      summary: 'Run it, in the background, in batches',
    })
    .input(z.object({ id: Id }))
    .output(Import),
  undoImport: base
    .route({
      method: 'POST',
      path: '/imports/{id}/undo',
      summary: 'Remove the records it created (to the recycle bin), within 30 days; updates stay',
    })
    .input(z.object({ id: Id }))
    .output(Import),
  importRows: base
    .route({
      method: 'GET',
      path: '/imports/{id}/rows',
      summary: 'Rows of an import, by what they did (errors first for the report)',
    })
    .input(
      z.object({
        id: Id,
        action: z.enum(IMPORT_ROW_ACTIONS).optional(),
        limit: z.coerce.number().int().min(1).max(1000).default(200),
      }),
    )
    .output(z.object({ data: z.array(ImportRow).max(1000) })),
  exports: base
    .route({ method: 'GET', path: '/exports', summary: 'Exports, newest first' })
    .input(TransferPage)
    .output(cursorPageOf(Export)),
  createExport: base
    .route({
      method: 'POST',
      path: '/exports',
      successStatus: 202,
      summary:
        'Export a list (its filters) to CSV or Excel in the background; a notification says when it is ready',
    })
    .input(
      z.object({
        recordType: TransferRecordType,
        format: z.enum(EXPORT_FORMATS).default('csv'),
        columns: z.array(z.string().max(100)).min(1).max(200),
        query: ExportQuery.default({}),
      }),
    )
    .output(Export),
};
