import { fields } from '@erxes/core-db/schema';
import { pluginFieldsContract } from './pluginFields';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { type FieldType, OPTION_FIELD_TYPES } from './values';
import { Id, IdList, isoDate, PropertyContentType, QueryBoolean, listOf } from './common';
import { FieldLogic } from './fieldLogic';
import { base, changes, code, description, int, label, Ok, order, Orders } from './fieldShared';

/** A custom field ("property") on customers, companies, products or a plugin's record type. */
export const Field = createSelectSchema(fields, {
  id: Id,
  contentType: () => PropertyContentType,
  groupId: () => Id,
  order: int,
  archivedAt: isoDate,
  createdAt: isoDate,
  logic: () => FieldLogic.nullable(),
})
  .pick({
    id: true,
    contentType: true,
    /** The group it is listed in; `null` for fields made before groups. */
    groupId: true,
    label: true,
    /** A stable key for integrations. */
    code: true,
    description: true,
    /** A Tabler icon name. */
    icon: true,
    type: true,
    /** Format text values must have. */
    validation: true,
    /** Choices for select / multiselect / radio / check. */
    options: true,
    /** Shown in record tables and the record panel. */
    isVisible: true,
    /** A record can't be made without a value, nor have it cleared, while the field shows. */
    isRequired: true,
    /** Asked for on the form that makes a record. */
    isVisibleToCreate: true,
    /** Customers fill it in on websites: at sign-up and on their profile (customer fields only). */
    customerEditable: true,
    /** Shows or hides it by other fields' values (`logicShows`); null: always shown. */
    logic: true,
    order: true,
    /** The plugin that declared it and writes its values (members only read it); null: a member's. */
    plugin: true,
    /** Set while it (or its group) is archived: hidden, values kept. */
    archivedAt: true,
    createdAt: true,
  })
  .extend({
    /** The plugin's title from its manifest, to list its fields under; null for members' fields. */
    pluginTitle: z.string().nullable(),
  });

export type Field = z.infer<typeof Field>;

/** Whether records hold values of the fields asked about. */
export const FieldUsage = z.object({
  /** Records holding a value of any of them. */
  records: z.int(),
  /** Records holding each option, per field id (option fields only). */
  options: z.record(Id, z.record(z.string(), z.int())),
  /** Nothing holds a value, so they can be deleted. */
  removable: z.boolean(),
});

export type FieldUsage = z.infer<typeof FieldUsage>;

const options = z.array(z.string().trim().min(1).max(200)).max(100);

/** What a field create or update may set. */
const FieldFields = createUpdateSchema(fields, {
  contentType: () => PropertyContentType.optional(),
  label,
  options: () => options,
  order,
  groupId: () => Id,
  code: () => code,
  description,
  icon: (icon) => icon.trim().max(100),
  logic: () => FieldLogic.nullable(),
}).pick({
  contentType: true,
  label: true,
  type: true,
  options: true,
  order: true,
  groupId: true,
  code: true,
  description: true,
  icon: true,
  validation: true,
  isVisible: true,
  isRequired: true,
  isVisibleToCreate: true,
  customerEditable: true,
  logic: true,
});

const needsOptions = (value: { type?: FieldType; options?: string[] }) =>
  !value.type || !OPTION_FIELD_TYPES.includes(value.type) || (value.options?.length ?? 0) > 0;

export const fieldsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/fields',
      summary:
        "Custom fields of a record type, in order. Archived ones (or those of an archived group) only with `archived=true`. Plugins read product fields (`products:read`) and their own record types'",
    })
    .input(
      z.object({
        contentType: PropertyContentType,
        groupId: Id.optional(),
        archived: QueryBoolean.optional(),
      }),
    )
    .output(listOf(Field)),
  usage: base
    .route({
      method: 'GET',
      path: '/fields/usage',
      summary:
        'How many records hold values of the given fields (or of a group’s fields). A plugin keeps its record types’ values, so their fields count none',
    })
    .input(
      z
        .object({ ids: IdList.optional(), groupId: Id.optional() })
        .refine(
          (value) => (value.ids?.length ?? 0) > 0 || !!value.groupId,
          'ids or groupId is required',
        ),
    )
    .output(FieldUsage),
  create: base
    .route({
      method: 'POST',
      path: '/fields',
      successStatus: 201,
      summary:
        'Add a custom field (owners and admins). 409 TAKEN for a taken label or code; 400 PLUGIN_NOT_INSTALLED for a `<plugin>.<type>` whose plugin this organisation has not installed',
    })
    .input(
      FieldFields.omit({ order: true })
        .required({ contentType: true, label: true, type: true })
        .refine(needsOptions, { path: ['options'], error: 'select fields need options' }),
    )
    .output(Field),
  update: base
    .route({
      method: 'PATCH',
      path: '/fields/{id}',
      summary:
        "Change a field. The type changes only within types sharing a stored value while records hold values (409 FIELD_IN_USE). A plugin's field takes only `isVisible` (403 PLUGIN_FIELD)",
    })
    .input(
      FieldFields.omit({ contentType: true })
        .extend({ id: Id })
        .refine(changes, 'nothing to update'),
    )
    .output(Field),
  reorder: base
    .route({
      method: 'POST',
      path: '/fields/order',
      summary: 'Set the order of fields (owners and admins)',
    })
    .input(Orders)
    .output(Ok),
  archive: base
    .route({
      method: 'POST',
      path: '/fields/archive',
      summary:
        "Archive fields: hidden everywhere, values kept (owners and admins). 403 PLUGIN_FIELD for a plugin's field",
    })
    .input(z.object({ ids: z.array(Id).min(1).max(100) }))
    .output(Ok),
  restore: base
    .route({
      method: 'POST',
      path: '/fields/{id}/restore',
      summary:
        "Restore an archived field (owners and admins). 403 PLUGIN_FIELD for a plugin's field",
    })
    .input(z.object({ id: Id }))
    .output(Field),
  removeUnused: base
    .route({
      method: 'POST',
      path: '/fields/remove',
      summary:
        "Delete fields no record holds a value of (owners and admins). 409 FIELD_IN_USE otherwise, 403 PLUGIN_FIELD for a plugin's field",
    })
    .input(z.object({ ids: z.array(Id).min(1).max(100) }))
    .output(Ok),
  remove: base
    .route({
      method: 'DELETE',
      path: '/fields/{id}',
      summary:
        "Delete a custom field and its values (owners and admins); on a plugin's record type only the definition, as the plugin keeps the values. 403 PLUGIN_FIELD for a plugin's field",
    })
    .input(z.object({ id: Id }))
    .output(Ok),
  ...pluginFieldsContract,
};
