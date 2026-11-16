import { CONTENT_TYPES, RELATION_FIELD_TYPES } from '@erxes/core-db/enums';
import { z } from 'zod';

/** The most relations one plugin declares, and fields one relation has. */
export const PLUGIN_RELATIONS_MAX = 20;

export const PLUGIN_RELATION_FIELDS_MAX = 30;

const ColumnName = z
  .string()
  .regex(/^[a-z][a-z0-9_]{0,49}$/, 'lower case letters, digits and _ (starting with a letter)')
  .refine((name) => name !== 'record_id', 'record_id is the column naming the customer or company');

/** A column of a relation's view members filter its rows by: `amount`, `stage`, `closed_at`. */
export const PluginRelationField = z
  .object({
    /** The view's column. */
    key: ColumnName,
    label: z.string().trim().min(1).max(100),
    type: z.enum(RELATION_FIELD_TYPES),
    /** A `select`'s choices, as the column holds them. */
    options: z.array(z.string().trim().min(1).max(200)).max(100).optional(),
    /** A `text[]` column (several members, labels): "is" means "has". */
    array: z.boolean().optional(),
    /** A `number` that is money, in the organisation's currency's smallest unit. */
    money: z.boolean().optional(),
  })
  .refine((field) => field.type !== 'select' || !!field.options?.length, {
    path: ['options'],
    error: 'select fields need options',
  })
  .refine((field) => !field.money || field.type === 'number', {
    path: ['money'],
    error: 'only number fields are money',
  });

export type PluginRelationField = z.infer<typeof PluginRelationField>;

/**
 * Records of the plugin that belong to customers or companies (a customer's deals, orders,
 * tickets), so their lists filter by them: "has more than 3 deals", "total won amount over
 * 1,000,000", "last order more than 60 days ago". The plugin keeps a view, `view`, named
 * `<plugin>_*` and owned by its database role, with one row per related record: `record_id` (the
 * customer's or company's id) and a column per field. It grants core reading it:
 *
 *   CREATE VIEW sales_customer_deals AS
 *     SELECT d.org_id, c.customer_id AS record_id, d.amount, d.stage, d.created_at
 *     FROM sales_deals d JOIN sales_deal_customers c ON c.deal_id = d.id AND c.org_id = d.org_id;
 *   GRANT SELECT ON sales_customer_deals TO erxes_core_reader;
 *
 * The view reads as its owner, so the plugin tables' row level security keeps it to the
 * organisation. Members whose role lacks `permission` don't see it in the filter.
 */
export const PluginRelation = z.object({
  key: z
    .string()
    .regex(/^[a-z][a-z0-9_]{0,39}$/, 'lower case letters, digits and _ (starting with a letter)'),
  contentType: z.enum(CONTENT_TYPES),
  /** What the related records are, in plural: `Deals`, `Orders`. */
  label: z.string().trim().min(1).max(60),
  view: z.string().regex(/^[a-z][a-z0-9_]{0,62}$/, 'a view of the plugin: <plugin>_<name>'),
  /** One of the manifest's `permissions`, which a member needs to filter by it. */
  permission: z.string().trim().max(120).optional(),
  fields: z
    .array(PluginRelationField)
    .max(PLUGIN_RELATION_FIELDS_MAX)
    .default([])
    .refine(
      (fields) => new Set(fields.map((field) => field.key)).size === fields.length,
      'each field key once',
    ),
});

export type PluginRelation = z.infer<typeof PluginRelation>;

/** The manifest's `relations`, each key once per record type. */
export const PluginRelations = z
  .array(PluginRelation)
  .max(PLUGIN_RELATIONS_MAX)
  .refine(
    (list) =>
      new Set(list.map((relation) => `${relation.contentType}:${relation.key}`)).size ===
      list.length,
    'each relation key once per record type',
  );
