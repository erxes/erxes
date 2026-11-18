import { DATA_EXTENSION_SORT_COLUMNS } from '@erxes/core-db/dataExtensionEnums';
import { SORT_DIRECTIONS } from '@erxes/core-db/enums';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id, IdList, isoDate, listOf, QueryBoolean } from './common';
import {
  DataExtensionFieldKey,
  DataExtensionObjectKey,
  DataExtensionRecordType,
} from './dataExtensionFields';
import { dataExtensionsBase as base } from './dataExtensions';
import { DataExtensionValues, DataExtensionValuesInput } from './dataExtensionValues';

/** A record of a custom object. */
export const DataExtensionRecord = z.object({
  id: Id,
  recordType: DataExtensionRecordType,
  /** The object's label field's value: what lists and pickers show. */
  label: z.string().nullable(),
  /** Order on a kanban board, lowest first. */
  position: z.number(),
  values: DataExtensionValues,
  createdBy: Id.nullable(),
  updatedBy: Id.nullable(),
  createdAt: isoDate(),
  updatedAt: isoDate(),
  /** Set while the record is in the recycle bin. */
  deletedAt: isoDate().nullable(),
});

export type DataExtensionRecord = z.infer<typeof DataExtensionRecord>;

/** A core or plugin record's Data Extensions values. */
export const DataExtensionHostValues = z.object({
  recordType: DataExtensionRecordType,
  recordId: Id,
  values: DataExtensionValues,
  /** Null until a value is first written. */
  updatedBy: Id.nullable(),
  updatedAt: isoDate().nullable(),
});

export type DataExtensionHostValues = z.infer<typeof DataExtensionHostValues>;

/** What a record list is ordered by: a field's key, or when records were made or changed. */
const SortField = z.union([DataExtensionFieldKey, z.enum(DATA_EXTENSION_SORT_COLUMNS)]);

const RecordInput = z.object({ objectKey: DataExtensionObjectKey, id: Id });

/** Records of a custom object: `objects.view` reads them, `objects.edit` and `.delete` change them. */
export const dataRecordsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/data-objects/{objectKey}/records',
      summary: 'Records of an object. 400 INVALID_FILTER for a filter its fields can’t take',
    })
    .input(
      CursorQuery.extend({
        objectKey: DataExtensionObjectKey,
        search: z.string().trim().max(100).optional(),
        /** JSON of a condition group (`RecordFilter`) over `subject.<field key>`, as views save it. */
        filter: z.string().max(20_000).optional(),
        sortField: SortField.default('createdAt'),
        sortDirection: z.enum(SORT_DIRECTIONS).default('desc'),
        /** The recycle bin instead of the records in use. */
        deleted: QueryBoolean.optional(),
        ids: IdList.optional(),
      }),
    )
    .output(cursorPageOf(DataExtensionRecord)),
  get: base
    .route({ method: 'GET', path: '/data-objects/{objectKey}/records/{id}', summary: 'One record' })
    .input(RecordInput)
    .output(DataExtensionRecord),
  create: base
    .route({
      method: 'POST',
      path: '/data-objects/{objectKey}/records',
      successStatus: 201,
      summary: 'Add a record. 409 TAKEN when a unique field’s value is',
    })
    .input(
      z.object({
        objectKey: DataExtensionObjectKey,
        values: DataExtensionValuesInput,
        position: z.number().optional(),
      }),
    )
    .output(DataExtensionRecord),
  update: base
    .route({
      method: 'PATCH',
      path: '/data-objects/{objectKey}/records/{id}',
      summary: 'Change some values; a value of null clears it. 409 TAKEN as on create',
    })
    .input(
      RecordInput.extend({ values: DataExtensionValuesInput, position: z.number().optional() }),
    )
    .output(DataExtensionRecord),
  remove: base
    .route({
      method: 'DELETE',
      path: '/data-objects/{objectKey}/records/{id}',
      summary: 'Move a record to the recycle bin for 30 days',
    })
    .input(RecordInput)
    .output(DataExtensionRecord),
  restore: base
    .route({
      method: 'POST',
      path: '/data-objects/{objectKey}/records/{id}/restore',
      summary: 'Bring a record back from the recycle bin',
    })
    .input(RecordInput)
    .output(DataExtensionRecord),
};

/**
 * Values on core's and plugins' records. They follow the record's own rights: reading needs
 * what reads the record (`contacts.view`, `hr.employee.view`), changing what changes it.
 */
export const dataValuesContract = {
  get: base
    .route({
      method: 'GET',
      path: '/data-values/{recordType}/{recordId}',
      summary: 'A record’s values',
    })
    .input(z.object({ recordType: DataExtensionRecordType, recordId: Id }))
    .output(DataExtensionHostValues),
  lookup: base
    .route({
      method: 'POST',
      path: '/data-values/{recordType}/lookup',
      summary: 'Values of up to 100 records at once, for a list’s columns',
    })
    .input(
      z.object({ recordType: DataExtensionRecordType, recordIds: z.array(Id).min(1).max(100) }),
    )
    .output(listOf(DataExtensionHostValues)),
  update: base
    .route({
      method: 'PATCH',
      path: '/data-values/{recordType}/{recordId}',
      summary: 'Change some of a record’s values; null clears one. 409 TAKEN for a unique value',
    })
    .input(
      z.object({
        recordType: DataExtensionRecordType,
        recordId: Id,
        values: DataExtensionValuesInput,
      }),
    )
    .output(DataExtensionHostValues),
};
