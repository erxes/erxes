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
  SCHEMA_BUSY,
  TAKEN,
});

const base = dataExtensionsBase;

const ObjectKeyInput = z.object({ key: DataExtensionObjectKey });
const FieldIdInput = z.object({ id: Id });

/**
 * Custom objects: the organisation's own record types, each kept in its own table. Members see
 * them with `objects.view`; changing them needs `properties.manage`.
 */
export const dataObjectsContract = {
  list: base
    .route({ method: 'GET', path: '/data-objects', summary: 'Custom objects, by label' })
    .input(z.object({ archived: QueryBoolean.optional() }))
    .output(listOf(DataExtensionObject)),
  get: base
    .route({ method: 'GET', path: '/data-objects/{key}', summary: 'One custom object' })
    .input(ObjectKeyInput)
    .output(DataExtensionObject),
  create: base
    .route({
      method: 'POST',
      path: '/data-objects',
      successStatus: 201,
      summary:
        'Add a custom object and its table. 409 TAKEN when the key is; 400 LIMIT_EXCEEDED past 50',
    })
    .input(DataExtensionObjectCreate)
    .output(DataExtensionObject),
  update: base
    .route({
      method: 'PATCH',
      path: '/data-objects/{key}',
      summary: 'Rename an object or pick its label field',
    })
    .input(DataExtensionObjectUpdate)
    .output(DataExtensionObject),
  archive: base
    .route({
      method: 'POST',
      path: '/data-objects/{key}/archive',
      summary: 'Hide an object; its records stay',
    })
    .input(ObjectKeyInput)
    .output(DataExtensionObject),
  restore: base
    .route({
      method: 'POST',
      path: '/data-objects/{key}/restore',
      summary: 'Bring back an archived object',
    })
    .input(ObjectKeyInput)
    .output(DataExtensionObject),
  remove: base
    .route({
      method: 'DELETE',
      path: '/data-objects/{key}',
      summary:
        'Drop an archived object, its records and its relations. 409 ARCHIVE_FIRST when it is active',
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
    .route({ method: 'GET', path: '/data-fields', summary: 'Fields of a record type, in order' })
    .input(z.object({ recordType: DataExtensionRecordType, archived: QueryBoolean.optional() }))
    .output(listOf(DataExtensionField)),
  create: base
    .route({
      method: 'POST',
      path: '/data-fields',
      successStatus: 201,
      summary:
        'Add a field and its column. 409 TAKEN when the key is; 400 LIMIT_EXCEEDED past 100; 400 INVALID_REFERENCE for an unknown record type',
    })
    .input(DataExtensionFieldCreate)
    .output(DataExtensionField),
  relate: base
    .route({
      method: 'POST',
      path: '/data-fields/relations',
      successStatus: 201,
      summary:
        'Link two record types: a field on each, made together. 400 INVALID_REFERENCE for an unknown type',
    })
    .input(DataExtensionRelationCreate)
    .output(z.object({ field: DataExtensionField, inverse: DataExtensionField })),
  update: base
    .route({
      method: 'PATCH',
      path: '/data-fields/{id}',
      summary: 'Change a field. 400 INVALID_TYPE for a type change its values cannot make',
    })
    .input(DataExtensionFieldUpdate)
    .output(DataExtensionField),
  preview: base
    .route({
      method: 'POST',
      path: '/data-fields/preview',
      summary:
        'Check a formula or rollup before saving it: what it gives, and its value on one record (`recordId`). 400 INVALID_INPUT names the problem and where in the formula it is',
    })
    .input(
      z.object({
        recordType: DataExtensionRecordType,
        formula: DataExtensionFormula.optional(),
        rollup: DataExtensionRollup.optional(),
        recordId: Id.optional(),
      }),
    )
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
      summary: 'Put a record type’s fields in this order',
    })
    .input(z.object({ recordType: DataExtensionRecordType, ids: z.array(Id).min(1).max(200) }))
    .output(listOf(DataExtensionField)),
  archive: base
    .route({
      method: 'POST',
      path: '/data-fields/{id}/archive',
      summary: 'Hide a field; its values stay',
    })
    .input(FieldIdInput)
    .output(DataExtensionField),
  restore: base
    .route({
      method: 'POST',
      path: '/data-fields/{id}/restore',
      summary: 'Bring back an archived field',
    })
    .input(FieldIdInput)
    .output(DataExtensionField),
  remove: base
    .route({
      method: 'DELETE',
      path: '/data-fields/{id}',
      summary:
        'Drop an archived field and its values; a relation drops both sides. 409 ARCHIVE_FIRST when it is active',
    })
    .input(FieldIdInput)
    .output(z.object({ id: Id })),
};
