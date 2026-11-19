import { DATA_EXTENSION_NATIVE_TYPES } from '@erxes/core-db/dataExtensionEnums';
import { oc } from '@orpc/contract';
import { z } from 'zod';
import { listOf, PluginRecordType } from './common';
import { COMMON_ERRORS } from './errors';
import { PLUGIN_RELATION_FIELDS_MAX, PluginRelationField } from './pluginRelations';
import { CORE_NATIVE_FIELDS } from './recordNativeFields';

/**
 * One of a manifest's `objects`: a record type of the plugin's that members may add fields to
 * (Data Extensions), and the plugin's permissions that read and change its records, which
 * guard those fields too. Without them every member may.
 */
export const PluginObject = z.object({
  /** `<plugin>.<type>`: `hr.employee`. */
  type: PluginRecordType,
  /** What a list of them is called: "Employees". */
  label: z.string().trim().min(1).max(100),
  /** One of them: "Employee". */
  singularLabel: z.string().trim().min(1).max(100),
  /** A Tabler icon name. */
  icon: z.string().trim().max(60).optional(),
  /** A permission action of the plugin that reads its records (`hr.employee.view`). */
  permission: z.string().optional(),
  /** A permission action of the plugin that changes its records (`hr.employee.edit`). */
  updatePermission: z.string().optional(),
  /**
   * A view of the plugin's (`<plugin>_*`, owned by its role and granted to erxes_core_reader)
   * with a row per record: `id` and a column per field of `fields`. Data Extensions reads
   * the records' own values there, for formulas, rollups and lookups:
   *
   *   CREATE VIEW sales_deal_fields AS SELECT d.org_id, d.id, d.name, d.amount, d.closed_at FROM sales_deals d;
   *   GRANT SELECT ON sales_deal_fields TO erxes_core_reader;
   */
  view: z
    .string()
    .regex(/^[a-z][a-z0-9_]{0,62}$/, 'a view of the plugin: <plugin>_<name>')
    .optional(),
  /** The view's columns members may use: `amount` a number, `stage` a select. */
  fields: z
    .array(PluginRelationField)
    .max(PLUGIN_RELATION_FIELDS_MAX)
    .refine((list) => new Set(list.map((field) => field.key)).size === list.length, 'each key once')
    .optional(),
});

export type PluginObject = z.infer<typeof PluginObject>;

/**
 * A field a record type has of its own (a customer's `firstName`, a deal's `amount`), which
 * formulas and rollups read by `key`. `member` and `product` hold ids.
 */
export const RecordNativeField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(DATA_EXTENSION_NATIVE_TYPES),
  /** A select's choices. */
  options: z.array(z.string()),
});

export type RecordNativeField = z.infer<typeof RecordNativeField>;

/** A manifest's `objects`, each type once. */
export const PluginObjects = z
  .array(PluginObject)
  .max(50)
  .refine(
    (list) => new Set(list.map((object) => object.type)).size === list.length,
    'each type once',
  );

/**
 * A record type that can be extended: one of core's (`core.customer`), a plugin's
 * (`hr.employee`) or a custom object (`custom.project`).
 */
export const RecordType = z.object({
  type: z.string(),
  /** The plugin that keeps the records; null for core's and custom objects. */
  plugin: z.string().nullable(),
  label: z.string(),
  singularLabel: z.string(),
  icon: z.string().nullable(),
  /** What reads the records; null: every member. */
  permission: z.string().nullable(),
  /** What changes them; null: every member. */
  updatePermission: z.string().nullable(),
  /** Its own fields, which formulas and rollups read: core's columns, a plugin's view. */
  nativeFields: z.array(RecordNativeField),
});

export type RecordType = z.infer<typeof RecordType>;

/** Core's record types others may extend. Leads are customers and companies in a lead stage. */
export const CORE_RECORD_TYPES: readonly RecordType[] = [
  {
    type: 'core.customer',
    plugin: null,
    label: 'Customers',
    singularLabel: 'Customer',
    icon: 'IconUser',
    permission: 'contacts.view',
    updatePermission: 'contacts.edit',
  },
  {
    type: 'core.company',
    plugin: null,
    label: 'Companies',
    singularLabel: 'Company',
    icon: 'IconBuilding',
    permission: 'contacts.view',
    updatePermission: 'contacts.edit',
  },
  {
    type: 'core.product',
    plugin: null,
    label: 'Products',
    singularLabel: 'Product',
    icon: 'IconPackage',
    permission: null,
    updatePermission: 'products.manage',
  },
  {
    type: 'core.member',
    plugin: null,
    label: 'Team members',
    singularLabel: 'Team member',
    icon: 'IconUsers',
    permission: 'team.view',
    updatePermission: 'team.manage',
  },
].map((type) => ({ ...type, nativeFields: [...(CORE_NATIVE_FIELDS[type.type] ?? [])] }));

/** The record types of core, of the plugins installed here and of custom objects. */
export const recordTypesContract = {
  list: oc
    .errors(COMMON_ERRORS)
    .route({
      method: 'GET',
      path: '/record-types',
      summary:
        "Record types that can be extended: core's, each installed plugin's manifest `objects`, then the active custom objects",
    })
    .output(listOf(RecordType)),
};
