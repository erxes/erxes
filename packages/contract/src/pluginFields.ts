import { CONTENT_TYPES, PLUGIN_FIELD_TYPES } from '@erxes/core-db/enums';
import { oc } from '@orpc/contract';
import { z } from 'zod';
import { AppliesTo, CustomFields, CustomFieldsPatch, Id, PluginRecordType } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

/** The most fields one plugin declares on core records. */
export const PLUGIN_FIELDS_MAX = 20;

/** The most values one `fields.setPluginValues` call writes. */
export const PLUGIN_VALUES_MAX = 500;

/**
 * A field a plugin keeps on customers or companies (a rollup: `total_spent`, `last_order_at`).
 * Core stores it as a custom field members filter (unless `filterable` is false), sort and save
 * views by, and shows read-only;
 * the plugin writes its values with `fields.setPluginValues`. Select types need `options`.
 */
export const PluginField = z
  .object({
    code: z
      .string()
      .regex(/^[a-z][a-z0-9_]{0,49}$/, 'lower case letters, digits and _ (starting with a letter)'),
    contentType: z.enum(CONTENT_TYPES),
    label: z.string().trim().min(1).max(100),
    type: z.enum(PLUGIN_FIELD_TYPES),
    options: z.array(z.string().trim().min(1).max(200)).max(100).optional(),
    description: z.string().trim().max(1000).optional(),
    /**
     * `false`: a column and sort key, not in list filters, where the plugin's `relations` filter
     * by the same records better ("Orders: count, only paid orders" over a paid-orders rollup).
     */
    filterable: z.boolean().optional(),
  })
  .refine(
    (field) => (field.type !== 'select' && field.type !== 'multiselect') || !!field.options?.length,
    { path: ['options'], error: 'select fields need options' },
  );

/**
 * The manifest's `fields`, each code and label once per record type, at most 20. Each
 * organisation that has the plugin gets them as read-only custom fields, listed under the
 * plugin's title; a field left out is archived (values kept) until it comes back, and a changed
 * `type` clears its values. The plugin writes values with `fields.setPluginValues` (scope
 * `fields:write`).
 */
export const PluginFields = z
  .array(PluginField)
  .max(PLUGIN_FIELDS_MAX)
  .refine(
    (list) =>
      new Set(list.map((field) => `${field.contentType}:${field.code}`)).size === list.length &&
      new Set(list.map((field) => `${field.contentType}:${field.label.toLowerCase()}`)).size ===
        list.length,
    'each code and label once per record type',
  );

/** A value of a plugin's field on one record: a number, a date (`YYYY-MM-DD`), text, option(s); null clears it. */
const PluginValue = z.object({
  recordId: Id,
  /** The field's `code` in the plugin's manifest. */
  code: z.string().min(1).max(50),
  value: z
    .union([z.number(), z.string().max(10_000), z.array(z.string().max(200)).max(100)])
    .nullable(),
});

/** A patch to a plugin record's custom field values, to check against its fields. */
export const PluginValuesCheck = z.object({
  contentType: PluginRecordType,
  /** The record's values as the plugin keeps them now. */
  current: CustomFields,
  patch: CustomFieldsPatch,
  /** What the record is in, by the keys groups' `appliesTo` name (`{ team: [id] }`). */
  appliesTo: AppliesTo.default({}),
  /**
   * The record is being made: each required field its create form asks for
   * (`isVisibleToCreate`) that applies and shows needs a value.
   */
  create: z.boolean().default(false),
});

export type PluginValuesCheck = z.infer<typeof PluginValuesCheck>;

const { INVALID_FIELD, INVALID_FIELD_VALUE } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, INVALID_FIELD, INVALID_FIELD_VALUE });

/** The procedures of `fieldsContract` for plugins that keep fields on core's records. */
export const pluginFieldsContract = {
  setPluginValues: base
    .route({
      method: 'POST',
      path: '/fields/plugin-values',
      summary: 'Write a plugin’s field values',
      description:
        "Write values of the calling plugin's own fields (by manifest `code`), up to 500; null clears one. Quiet: no timeline entry, event, audit row or notification. Records not found are skipped. 400 INVALID_FIELD for a code the manifest doesn't declare, INVALID_FIELD_VALUE for a value that doesn't fit",
    })
    .input(
      z.object({
        contentType: z.enum(CONTENT_TYPES),
        values: z.array(PluginValue).min(1).max(PLUGIN_VALUES_MAX),
      }),
    )
    .output(
      z.object({
        /** Values written or cleared. */
        written: z.int(),
        /** Ids of records that don't exist here (deleted, or never this organisation's). */
        skipped: z.array(Id),
      }),
    ),
  check: base
    .route({
      method: 'POST',
      path: '/fields/check',
      summary: 'Check custom field values',
      description:
        "Apply a patch to a record's custom field values, for a plugin that keeps them (its own `<plugin>.<type>`): the values to save, checked and trimmed; null or empty clears one. Core stores nothing. 400 INVALID_FIELD for a field not of that type, archived, or in a group that doesn't apply to the record (`appliesTo`), INVALID_FIELD_VALUE for a value that doesn't fit or a required field left empty while it shows; 403 NOT_ALLOWED for another plugin's type",
    })
    .input(PluginValuesCheck)
    .output(z.object({ values: CustomFields })),
};
