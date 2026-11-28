import { CONTENT_TYPES, PLUGIN_FIELD_TYPES } from '@erxes/core-db/enums';
import { z } from 'zod';
import { Id } from './common';

/** The most fields one plugin declares on core records. */
export const PLUGIN_FIELDS_MAX = 20;

/** The most values one `dataValues.setPluginValues` call writes. */
export const PLUGIN_VALUES_MAX = 500;

/**
 * A field a plugin keeps on customers or companies (a rollup: `total_spent`, `last_order_at`).
 * Core makes it a Data Extensions field the plugin owns, with the code as its key: members
 * filter (unless `filterable` is false), sort and save views by it, and read it; the plugin
 * writes its values with `dataValues.setPluginValues`. Select types need `options`.
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
 * organisation that has the plugin gets them as read-only Data Extensions fields; a field left
 * out is archived (values kept) until it comes back, and a changed `type` clears its values.
 * The plugin writes values with `dataValues.setPluginValues` (scope `fields:write`).
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
export const PluginValue = z.object({
  recordId: Id,
  /** The field's `code` in the plugin's manifest. */
  code: z.string().min(1).max(50),
  value: z
    .union([z.number(), z.string().max(10_000), z.array(z.string().max(200)).max(100)])
    .nullable(),
});

/** Values of a plugin's own fields on core's records, by the manifest's codes. */
export const PluginValuesInput = z.object({
  contentType: z.enum(CONTENT_TYPES),
  values: z.array(PluginValue).min(1).max(PLUGIN_VALUES_MAX),
});

/** What a write of a plugin's values did. */
export const PluginValuesWritten = z.object({
  /** Values written or cleared. */
  written: z.int(),
  /** Ids of records that don't exist here (deleted, or never this organisation's). */
  skipped: z.array(Id),
});
