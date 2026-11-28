import { oc } from '@orpc/contract';
import { z } from 'zod';
import { listOf, PluginRecordType } from './common';
import { COMMON_ERRORS } from './errors';

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
});

export type PluginObject = z.infer<typeof PluginObject>;

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
export const ExtendableRecordType = z.object({
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
});

export type ExtendableRecordType = z.infer<typeof ExtendableRecordType>;

/** Core's record types others may extend. Leads are customers and companies in a lead stage. */
export const CORE_RECORD_TYPES: readonly ExtendableRecordType[] = [
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
];

/** The record types of core, of the plugins installed here and of custom objects. */
export const recordTypesContract = {
  list: oc
    .errors(COMMON_ERRORS)
    .route({
      method: 'GET',
      path: '/record-types',
      summary: 'List extendable record types',
      description:
        "Record types that can carry fields: core's, each installed plugin's manifest `objects`, then the active custom objects.",
    })
    .output(listOf(ExtendableRecordType)),
};
