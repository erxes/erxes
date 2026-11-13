import { oc } from '@orpc/contract';
import { z } from 'zod';
import { ConditionGroup } from './automationDefinition';
import { Id } from './common';

export const TransferRecordType = z.enum(['customer', 'lead', 'company']);

export type TransferRecordType = z.infer<typeof TransferRecordType>;

/** A column imports map to and exports write: built-in fields, properties (`customFields.<id>`), tags, owner, companies. */
export const TransferColumn = z.object({
  key: z.string(),
  label: z.string(),
  group: z.enum(['fields', 'custom', 'relations']),
  importable: z.boolean(),
  exportable: z.boolean(),
  /** Exported unless the member unticks it. */
  default: z.boolean(),
});

export type TransferColumn = z.infer<typeof TransferColumn>;

export const ImportOptions = z.object({
  mode: z.enum(['create', 'update', 'upsert']).default('create'),
  matchBy: z.enum(['email', 'phone', 'code', 'id', 'name']).default('email'),
  tagIds: z.array(Id).max(50).optional(),
  ownerId: Id.nullable().optional(),
  createMissing: z.boolean().default(true),
  runAutomations: z.boolean().default(false),
});

export type ImportOptions = z.infer<typeof ImportOptions>;

export const ImportStatus = z.enum([
  'parsing',
  'mapping',
  'checking',
  'checked',
  'running',
  'done',
  'failed',
  'undone',
]);

const Counts = z.object({
  rows: z.int(),
  create: z.int(),
  update: z.int(),
  skip: z.int(),
  error: z.int(),
});

export const Import = z.object({
  id: Id,
  recordType: TransferRecordType,
  fileName: z.string(),
  status: ImportStatus,
  headers: z.array(z.string()),
  /** Column index → field key; unmapped columns are ignored. */
  mapping: z.record(z.string(), z.string()),
  options: ImportOptions,
  counts: Counts,
  processed: z.int(),
  /** The first rows, to check the mapping against. */
  sample: z.array(z.array(z.string())),
  error: z.string().nullable(),
  /** Its created records can still be removed (30 days). */
  undoable: z.boolean(),
  createdBy: Id,
  createdAt: z.iso.datetime(),
  finishedAt: z.iso.datetime().nullable(),
});

export type Import = z.infer<typeof Import>;

export const ImportRow = z.object({
  rowNumber: z.int(),
  cells: z.array(z.string()),
  action: z.enum(['create', 'update', 'skip', 'error']).nullable(),
  error: z.string().nullable(),
  recordId: z.string().nullable(),
});

/** What an export reproduces: the list's filters as the member sees them. */
export const ExportQuery = z.object({
  filter: ConditionGroup.nullable().optional(),
  search: z.string().trim().max(100).optional(),
  tagIds: z.array(Id).max(50).optional(),
  ownerId: Id.optional(),
});

export type ExportQuery = z.infer<typeof ExportQuery>;

export const Export = z.object({
  id: Id,
  recordType: TransferRecordType,
  format: z.enum(['csv', 'xlsx']),
  columns: z.array(z.string()),
  status: z.enum(['running', 'done', 'failed']),
  rowCount: z.int().nullable(),
  /** The file (download at `/files/{fileId}/download`). */
  fileId: Id.nullable(),
  error: z.string().nullable(),
  createdBy: Id,
  createdAt: z.iso.datetime(),
  finishedAt: z.iso.datetime().nullable(),
});

export type Export = z.infer<typeof Export>;

/** Imports from CSV or Excel (mapped, checked, run in the background, undoable) and exports of lists. */
export const transferContract = {
  columns: oc
    .route({
      method: 'GET',
      path: '/transfer/columns',
      summary: 'What imports can fill and exports can write, for a record type',
    })
    .input(z.object({ recordType: TransferRecordType }))
    .output(z.object({ data: z.array(TransferColumn) })),
  imports: oc
    .route({ method: 'GET', path: '/imports', summary: 'Imports, newest first' })
    .output(z.object({ data: z.array(Import) })),
  import: oc
    .route({ method: 'GET', path: '/imports/{id}' })
    .input(z.object({ id: Id }))
    .output(Import),
  createImport: oc
    .route({
      method: 'POST',
      path: '/imports',
      successStatus: 201,
      summary:
        'Start an import from an uploaded CSV or Excel file (≤ 100,000 rows): it is read, then columns are suggested',
    })
    .input(z.object({ recordType: TransferRecordType, fileId: Id }))
    .output(Import),
  updateImport: oc
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
  checkImport: oc
    .route({
      method: 'POST',
      path: '/imports/{id}/check',
      summary: 'A dry run: what each row would do (create, update, skip, error), changing nothing',
    })
    .input(z.object({ id: Id }))
    .output(Import),
  startImport: oc
    .route({
      method: 'POST',
      path: '/imports/{id}/start',
      summary: 'Run it, in the background, in batches',
    })
    .input(z.object({ id: Id }))
    .output(Import),
  undoImport: oc
    .route({
      method: 'POST',
      path: '/imports/{id}/undo',
      summary: 'Remove the records it created (to the recycle bin), within 30 days; updates stay',
    })
    .input(z.object({ id: Id }))
    .output(Import),
  importRows: oc
    .route({
      method: 'GET',
      path: '/imports/{id}/rows',
      summary: 'Rows of an import, by what they did (errors first for the report)',
    })
    .input(
      z.object({
        id: Id,
        action: z.enum(['create', 'update', 'skip', 'error']).optional(),
        limit: z.coerce.number().int().min(1).max(1000).prefault(200),
      }),
    )
    .output(z.object({ data: z.array(ImportRow) })),
  exports: oc
    .route({ method: 'GET', path: '/exports', summary: 'Exports, newest first' })
    .output(z.object({ data: z.array(Export) })),
  createExport: oc
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
        format: z.enum(['csv', 'xlsx']).default('csv'),
        columns: z.array(z.string().max(100)).min(1).max(200),
        query: ExportQuery.default({}),
      }),
    )
    .output(Export),
};
