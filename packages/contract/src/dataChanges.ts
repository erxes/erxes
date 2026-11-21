import {
  DATA_EXTENSION_CHANGE_KINDS,
  DATA_EXTENSION_CONVERTIBLE_TYPES,
} from '@erxes/core-db/dataExtensionEnums';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id, isoDate } from './common';
import {
  DataExtensionField,
  DataExtensionFieldKey,
  DataExtensionFieldType,
  DataExtensionOptions,
  DataExtensionRecordType,
} from './dataExtensionFields';
import { dataExtensionsBase } from './dataExtensions';
import { ERRORS } from './errors';
import { ActorType } from './platform';

/** One field's value before and after a write. */
export const DataExtensionValueChange = z.object({
  fieldId: Id,
  /** The field's key, label and type when the change was made. */
  key: DataExtensionFieldKey,
  label: z.string(),
  type: DataExtensionFieldType,
  from: z.json(),
  to: z.json(),
});

/** A write to a record's values: who made it, when, and each value it changed. */
export const DataExtensionChange = z.object({
  id: Id,
  /** `created` for a new custom record, `updated` for later writes. */
  kind: z.enum(DATA_EXTENSION_CHANGE_KINDS),
  changes: z.array(DataExtensionValueChange),
  actorType: ActorType,
  actorId: Id.nullable(),
  actorName: z.string().nullable(),
  occurredAt: isoDate(),
});

export type DataExtensionChange = z.infer<typeof DataExtensionChange>;

const ConvertibleType = z.enum(DATA_EXTENSION_CONVERTIBLE_TYPES);

/** What converting a field gives: how many values carry over, and some that don't. */
export const DataExtensionConversion = z.object({
  converted: z.int(),
  unconvertible: z.int(),
  /** Up to 5 values that don't fit the new type, as text. */
  samples: z.array(z.string()).max(5),
  /** A select's options after the conversion: those sent, or made from the values. */
  options: DataExtensionOptions,
  /** The converted field; null for a dry run. */
  field: DataExtensionField.nullable(),
});

const base = dataExtensionsBase.errors({ UNCONVERTIBLE: ERRORS.UNCONVERTIBLE });

/**
 * A record's value history, and the changes to fields that rewrite every record's values.
 * History follows the record's read rights, and leaves out fields the caller can't see.
 */
export const dataChangesContract = {
  history: base
    .route({
      method: 'GET',
      path: '/data-history/{recordType}/{recordId}',
      summary: 'Who changed a record’s values, when and from what, newest first',
    })
    .input(CursorQuery.extend({ recordType: DataExtensionRecordType, recordId: Id }))
    .output(cursorPageOf(DataExtensionChange)),
  convert: base
    .route({
      method: 'POST',
      path: '/data-fields/{id}/convert',
      summary:
        'Convert a field to another type, its values carried over where they fit. `apply` false is a dry run; 409 UNCONVERTIBLE when values would be cleared and `clearUnconvertible` is not set',
    })
    .input(
      z.object({
        id: Id,
        type: ConvertibleType,
        /** A select's options; made from the field's values when left out. */
        options: DataExtensionOptions.optional(),
        apply: z.boolean().default(false),
        clearUnconvertible: z.boolean().default(false),
      }),
    )
    .output(DataExtensionConversion),
  remove: base
    .route({
      method: 'POST',
      path: '/data-values/{recordType}/remove',
      summary:
        'A plugin’s records are gone: clear their values, their links and their value history',
    })
    .input(
      z.object({ recordType: DataExtensionRecordType, recordIds: z.array(Id).min(1).max(100) }),
    )
    .output(z.object({ removed: z.int() })),
};
