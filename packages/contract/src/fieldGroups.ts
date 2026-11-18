import { fieldGroups } from '@erxes/core-db/schema';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { AppliesTo, Id, isoDate, PropertyContentType, QueryBoolean, listOf } from './common';
import { base, changes, code, description, int, label, Ok, order, Orders } from './fieldShared';

/** A group of custom fields of a record type. */
export const FieldGroup = createSelectSchema(fieldGroups, {
  id: Id,
  contentType: () => PropertyContentType,
  order: int,
  appliesTo: () => AppliesTo,
  archivedAt: isoDate,
  createdAt: isoDate,
}).pick({
  id: true,
  contentType: true,
  name: true,
  code: true,
  description: true,
  order: true,
  /** On a plugin's type, the records it shows on (ids by key); empty: every record. */
  appliesTo: true,
  archivedAt: true,
  createdAt: true,
});

export type FieldGroup = z.infer<typeof FieldGroup>;

/** What a field group create or update may set. */
const GroupFields = createUpdateSchema(fieldGroups, {
  contentType: () => PropertyContentType.optional(),
  name: label,
  code: () => code,
  description,
  order,
  appliesTo: () => AppliesTo,
}).pick({
  contentType: true,
  name: true,
  code: true,
  description: true,
  order: true,
  appliesTo: true,
});

export const fieldGroupsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/field-groups',
      summary:
        "Field groups of a record type, in order. Archived ones only with `archived=true`. Plugins read product groups (`products:read`) and their own record types'",
    })
    .input(z.object({ contentType: PropertyContentType, archived: QueryBoolean.optional() }))
    .output(listOf(FieldGroup)),
  create: base
    .route({
      method: 'POST',
      path: '/field-groups',
      successStatus: 201,
      summary:
        "Add a field group (owners and admins). The code defaults to the name; `appliesTo` limits a plugin type's group to some of its records. 409 TAKEN for a taken code, 400 PLUGIN_NOT_INSTALLED as for fields, INVALID_FIELD_GROUP for `appliesTo` on core's records",
    })
    .input(GroupFields.omit({ order: true }).required({ contentType: true, name: true }))
    .output(FieldGroup),
  update: base
    .route({
      method: 'PATCH',
      path: '/field-groups/{id}',
      summary:
        'Rename a field group or change the records it applies to (owners and admins). 400 INVALID_FIELD_GROUP for `appliesTo` on core’s records',
    })
    .input(
      GroupFields.omit({ contentType: true })
        .extend({ id: Id })
        .refine(changes, 'nothing to update'),
    )
    .output(FieldGroup),
  reorder: base
    .route({
      method: 'POST',
      path: '/field-groups/order',
      summary: 'Set the order of field groups (owners and admins)',
    })
    .input(Orders)
    .output(Ok),
  archive: base
    .route({
      method: 'POST',
      path: '/field-groups/{id}/archive',
      summary: 'Archive a group: it and its fields are hidden, values kept (owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(FieldGroup),
  restore: base
    .route({
      method: 'POST',
      path: '/field-groups/{id}/restore',
      summary: 'Restore an archived group (owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(FieldGroup),
  remove: base
    .route({
      method: 'DELETE',
      path: '/field-groups/{id}',
      summary:
        'Delete a group and its fields when no record holds their values (owners and admins). 409 FIELD_IN_USE otherwise',
    })
    .input(z.object({ id: Id }))
    .output(Ok),
};
