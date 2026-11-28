import { DATA_EXTENSION_SORT_COLUMNS } from '@erxes/core-db/dataExtensionEnums';
import { SORT_DIRECTIONS } from '@erxes/core-db/enums';
import { z } from 'zod';
import {
  AppliesTo,
  CursorQuery,
  cursorPageOf,
  Id,
  IdList,
  isoDate,
  listOf,
  QueryBoolean,
} from './common';
import { ERRORS } from './errors';
import { PluginValuesInput, PluginValuesWritten } from './dataPluginFields';
import { DataExtensionFieldKey } from './dataExtensionConditions';
import { DataExtensionObjectKey, DataExtensionRecordType } from './dataExtensionFields';
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

/** A new record of a custom object. */
export const DataExtensionRecordCreate = z.object({
  objectKey: DataExtensionObjectKey,
  values: DataExtensionValuesInput,
  position: z.number().optional(),
});

/** Values to write on one of core's or a plugin's records; null clears one. */
export const DataExtensionValuesUpdate = z.object({
  recordType: DataExtensionRecordType,
  recordId: Id,
  values: DataExtensionValuesInput,
});

/** Records of a custom object: `objects.view` reads them, `objects.edit` and `.delete` change them. */
export const dataRecordsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/data-objects/{objectKey}/records',
      summary: 'List a custom object’s records',
      description:
        'A page of an object’s records, searched, filtered and sorted by its fields; `deleted: true` lists the recycle bin. 400 INVALID_FILTER for a filter or sort its fields can’t take.',
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
    .route({
      method: 'GET',
      path: '/data-objects/{objectKey}/records/{id}',
      summary: 'Get a custom record',
      description:
        'One record of a custom object, with its values. 404 NOT_FOUND when there is none.',
    })
    .input(RecordInput)
    .output(DataExtensionRecord),
  create: base
    .route({
      method: 'POST',
      path: '/data-objects/{objectKey}/records',
      successStatus: 201,
      summary: 'Add a custom record',
      description:
        'Adds a record to a custom object with its values. 400 INVALID_INPUT for a value its field refuses; 409 TAKEN when a unique field’s value is taken.',
    })
    .input(DataExtensionRecordCreate)
    .output(DataExtensionRecord),
  update: base
    .route({
      method: 'PATCH',
      path: '/data-objects/{objectKey}/records/{id}',
      summary: 'Change a custom record',
      description:
        'Changes the values given and keeps the rest; null clears a value. 409 TAKEN when a unique field’s value is taken.',
    })
    .input(
      RecordInput.extend({ values: DataExtensionValuesInput, position: z.number().optional() }),
    )
    .output(DataExtensionRecord),
  remove: base
    .route({
      method: 'DELETE',
      path: '/data-objects/{objectKey}/records/{id}',
      summary: 'Move a custom record to the recycle bin',
      description:
        'Moves a record to the recycle bin, where it stays 30 days before it is deleted for good.',
    })
    .input(RecordInput)
    .output(DataExtensionRecord),
  restore: base
    .route({
      method: 'POST',
      path: '/data-objects/{objectKey}/records/{id}/restore',
      summary: 'Restore a custom record',
      description: 'Brings a record back from the recycle bin with its values and links.',
    })
    .input(RecordInput)
    .output(DataExtensionRecord),
};

/** Values by field id, as a plugin keeps them in its records' `custom_fields`. */
const ValuesById = z.record(Id, z.json());

/** A plugin record's values to check before the plugin saves them. */
export const DataExtensionValuesCheck = z.object({
  recordType: DataExtensionRecordType,
  /** The values the record holds now, by field id; empty for a new record. */
  current: ValuesById.default({}),
  patch: z.record(Id, z.json().nullable()),
  /** A new record: every value is checked, defaults fill the rest, and required `showInCreate` fields need one. */
  create: z.boolean().default(false),
  /** The member who made the change: their role must be allowed to change these fields. */
  userId: Id.optional(),
  /**
   * What the record is in, by the keys groups' `appliesTo` name (`{ team: [id] }`): a field
   * whose group doesn't apply is skipped, so it isn't required and a patch can't set it.
   */
  appliesTo: AppliesTo.default({}),
});

/**
 * Values on core's and plugins' records. They follow the record's own rights: reading needs
 * what reads the record (`contacts.view`, `hr.employee.view`), changing what changes it. Core
 * keeps its own records' values; a plugin keeps its records' in its `custom_fields` (by field
 * id), checks them with `check` before it saves them, and core reads them from its view.
 */
export const dataValuesContract = {
  get: base
    .route({
      method: 'GET',
      path: '/data-values/{recordType}/{recordId}',
      summary: 'Get a record’s field values',
      description:
        'The Data Extensions values of one of core’s or a plugin’s records that the caller may see, with its formulas’ and rollups’. A plugin’s are read from its view.',
    })
    .input(z.object({ recordType: DataExtensionRecordType, recordId: Id }))
    .output(DataExtensionHostValues),
  lookup: base
    .route({
      method: 'POST',
      path: '/data-values/{recordType}/lookup',
      summary: 'Look up field values of many records',
      description:
        'The values of up to 100 records of one record type at once, for a list’s columns.',
    })
    .input(
      z.object({ recordType: DataExtensionRecordType, recordIds: z.array(Id).min(1).max(100) }),
    )
    .output(listOf(DataExtensionHostValues)),
  update: base
    .route({
      method: 'PATCH',
      path: '/data-values/{recordType}/{recordId}',
      summary: 'Change a core record’s field values',
      description:
        'Changes the values given on one of core’s records and keeps the rest; null clears a value. 409 TAKEN when a unique field’s value is taken; 400 INVALID_REFERENCE for a plugin’s record type, whose plugin keeps the values.',
    })
    .input(DataExtensionValuesUpdate)
    .output(DataExtensionHostValues),
  check: base
    .route({
      method: 'POST',
      path: '/data-values/{recordType}/check',
      summary: 'Check a plugin record’s field values',
      description:
        'A plugin checks its own record’s values before it saves them: answers the record’s values after `patch` (null clears one), checked and normalised. A required field needs a value only while it shows, where the patch names it or, with `create`, its create form shows it. 400 INVALID_INPUT names each value that isn’t valid, required field left empty or field id that isn’t active; 403 NOT_ALLOWED for another plugin’s record type.',
    })
    .input(DataExtensionValuesCheck)
    .output(z.object({ values: ValuesById })),
  setPluginValues: base
    .errors({
      INVALID_FIELD: ERRORS.INVALID_FIELD,
      INVALID_FIELD_VALUE: ERRORS.INVALID_FIELD_VALUE,
    })
    .route({
      method: 'POST',
      path: '/data-values/plugin-values',
      summary: 'Write a plugin’s own field values',
      description:
        "Writes values of the calling plugin's own fields on customers or companies, by manifest `code`, up to 500; null clears one. Quiet: no history entry, event, audit row or notification. Records not found are skipped. 400 INVALID_FIELD for a code the manifest doesn't declare, INVALID_FIELD_VALUE for a value that doesn't fit.",
    })
    .input(PluginValuesInput)
    .output(PluginValuesWritten),
};
