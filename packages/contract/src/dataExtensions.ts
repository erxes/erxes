import { oc } from '@orpc/contract';
import { z } from 'zod';
import { Id, listOf, QueryBoolean } from './common';
import {
  DataExtensionField,
  DataExtensionFieldCreate,
  DataExtensionFieldUpdate,
  DataExtensionObject,
  DataExtensionObjectCreate,
  DataExtensionObjectKey,
  DataExtensionObjectUpdate,
  DataExtensionFormula,
  DataExtensionRecordType,
  DataExtensionRelationCreate,
  DataExtensionResultType,
  DataExtensionRollup,
} from './dataExtensionFields';
import { COMMON_ERRORS, ERRORS } from './errors';

const {
  ARCHIVE_FIRST,
  FIELD_IN_USE,
  INVALID_CURSOR,
  INVALID_FILTER,
  INVALID_REFERENCE,
  INVALID_TYPE,
  LIMIT_EXCEEDED,
  NOT_ACTIVE,
  PLUGIN_FIELD,
  SCHEMA_BUSY,
  TAKEN,
} = ERRORS;

/** What Data Extensions' procedures answer with besides the common errors. */
export const dataExtensionsBase = oc.errors({
  ...COMMON_ERRORS,
  ARCHIVE_FIRST,
  FIELD_IN_USE,
  INVALID_CURSOR,
  INVALID_FILTER,
  INVALID_REFERENCE,
  INVALID_TYPE,
  LIMIT_EXCEEDED,
  NOT_ACTIVE,
  PLUGIN_FIELD,
  SCHEMA_BUSY,
  TAKEN,
});

const base = dataExtensionsBase;

const ObjectKeyInput = z.object({ key: DataExtensionObjectKey });
const FieldIdInput = z.object({ id: Id });

/** A formula or rollup to try before it is saved, on one record when `recordId` is given. */
export const DataExtensionComputedPreview = z.object({
  recordType: DataExtensionRecordType,
  formula: DataExtensionFormula.optional(),
  rollup: DataExtensionRollup.optional(),
  recordId: Id.optional(),
});

/**
 * Custom objects: the organisation's own record types, each kept in its own table. Members see
 * them with `objects.view`; changing them needs `properties.manage`.
 */
export const dataObjectsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/data-objects',
      summary: 'List custom objects',
      description:
        'The organisation’s custom objects, by label. `archived: true` lists the archived ones instead.',
    })
    .input(z.object({ archived: QueryBoolean.optional() }))
    .output(listOf(DataExtensionObject)),
  get: base
    .route({
      method: 'GET',
      path: '/data-objects/{key}',
      summary: 'Get a custom object',
      description: 'One custom object by its key. 404 NOT_FOUND when there is none.',
    })
    .input(ObjectKeyInput)
    .output(DataExtensionObject),
  create: base
    .route({
      method: 'POST',
      path: '/data-objects',
      successStatus: 201,
      summary: 'Add a custom object',
      description:
        'Adds a custom object and creates its table. 409 TAKEN when the key is taken; 400 LIMIT_EXCEEDED past 50 objects.',
    })
    .input(DataExtensionObjectCreate)
    .output(DataExtensionObject),
  update: base
    .route({
      method: 'PATCH',
      path: '/data-objects/{key}',
      summary: 'Change a custom object',
      description:
        'Renames an object, changes its icon or picks the field that labels its records.',
    })
    .input(DataExtensionObjectUpdate)
    .output(DataExtensionObject),
  archive: base
    .route({
      method: 'POST',
      path: '/data-objects/{key}/archive',
      summary: 'Archive a custom object',
      description: 'Hides an object from menus and pickers. Its records and fields stay.',
    })
    .input(ObjectKeyInput)
    .output(DataExtensionObject),
  restore: base
    .route({
      method: 'POST',
      path: '/data-objects/{key}/restore',
      summary: 'Restore an archived custom object',
      description: 'Brings back an archived object with its records and fields.',
    })
    .input(ObjectKeyInput)
    .output(DataExtensionObject),
  remove: base
    .route({
      method: 'DELETE',
      path: '/data-objects/{key}',
      summary: 'Delete an archived custom object',
      description:
        'Drops an archived object’s table, its records and the relations that point at it. 409 ARCHIVE_FIRST when the object is active.',
    })
    .input(ObjectKeyInput)
    .output(z.object({ key: DataExtensionObjectKey })),
};

/**
 * The fields of a record type: a custom object's, or one of core's or a plugin's. Every member
 * reads them; changing them needs `properties.manage`.
 */
export const dataFieldsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/data-fields',
      summary: 'List a record type’s fields',
      description:
        'The fields of a record type, in their order. `archived: true` lists the archived ones instead.',
    })
    .input(z.object({ recordType: DataExtensionRecordType, archived: QueryBoolean.optional() }))
    .output(listOf(DataExtensionField)),
  create: base
    .route({
      method: 'POST',
      path: '/data-fields',
      successStatus: 201,
      summary: 'Add a field',
      description:
        'Adds a field to a record type and creates its column, none for a plugin’s record type, whose plugin keeps the values. 409 TAKEN when the key is taken; 400 LIMIT_EXCEEDED past 100 fields; 400 INVALID_REFERENCE for an unknown record type; 400 INVALID_INPUT for a unique field or an auto number on a plugin’s record type.',
    })
    .input(DataExtensionFieldCreate)
    .output(DataExtensionField),
  relate: base
    .route({
      method: 'POST',
      path: '/data-fields/relations',
      successStatus: 201,
      summary: 'Link two record types',
      description:
        'Adds a relation field on each of two record types, made together, and answers both. 400 INVALID_REFERENCE for an unknown record type.',
    })
    .input(DataExtensionRelationCreate)
    .output(z.object({ field: DataExtensionField, inverse: DataExtensionField })),
  update: base
    .route({
      method: 'PATCH',
      path: '/data-fields/{id}',
      summary: 'Change a field',
      description:
        'Changes a field’s label, options, settings or type. 400 INVALID_TYPE for a type change its stored values can’t make.',
    })
    .input(DataExtensionFieldUpdate)
    .output(DataExtensionField),
  preview: base
    .route({
      method: 'POST',
      path: '/data-fields/preview',
      summary: 'Preview a formula or rollup',
      description:
        'Checks a formula or rollup before it is saved: what type it gives, and its value on one record (`recordId`). 400 INVALID_INPUT names the problem and where in the formula it is.',
    })
    .input(DataExtensionComputedPreview)
    .output(
      z.object({
        result: DataExtensionResultType,
        /** Its value on `recordId`'s record; null without one. */
        value: z.json().nullable(),
      }),
    ),
  reorder: base
    .route({
      method: 'POST',
      path: '/data-fields/reorder',
      summary: 'Reorder a record type’s fields',
      description: 'Puts a record type’s fields in the order of `ids` and answers them in it.',
    })
    .input(z.object({ recordType: DataExtensionRecordType, ids: z.array(Id).min(1).max(200) }))
    .output(listOf(DataExtensionField)),
  archive: base
    .route({
      method: 'POST',
      path: '/data-fields/{id}/archive',
      summary: 'Archive a field',
      description: 'Hides a field from forms, lists and filters. Its values stay.',
    })
    .input(FieldIdInput)
    .output(DataExtensionField),
  restore: base
    .route({
      method: 'POST',
      path: '/data-fields/{id}/restore',
      summary: 'Restore an archived field',
      description: 'Brings back an archived field with its values.',
    })
    .input(FieldIdInput)
    .output(DataExtensionField),
  remove: base
    .route({
      method: 'DELETE',
      path: '/data-fields/{id}',
      summary: 'Delete an archived field',
      description:
        'Drops an archived field’s column and its values; deleting a relation drops both sides. 409 ARCHIVE_FIRST when the field is active.',
    })
    .input(FieldIdInput)
    .output(z.object({ id: Id })),
};
