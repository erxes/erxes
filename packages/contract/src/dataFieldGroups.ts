import { dataFieldGroups } from '@erxes/core-db/schema';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { AppliesTo, Id, isoDate, listOf, QueryBoolean } from './common';
import { DataExtensionRecordType } from './dataExtensionFields';
import { dataExtensionsBase } from './dataExtensions';
import { ERRORS } from './errors';

/** A section a record type's fields show under, in order. */
export const DataExtensionFieldGroup = createSelectSchema(dataFieldGroups, {
  id: Id,
  recordType: DataExtensionRecordType,
  position: z.int(),
  appliesTo: () => AppliesTo,
  archivedAt: isoDate,
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  id: true,
  recordType: true,
  label: true,
  code: true,
  description: true,
  position: true,
  /** On a plugin's record type, the records it shows on (ids by key); empty: every record. */
  appliesTo: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type DataExtensionFieldGroup = z.infer<typeof DataExtensionFieldGroup>;

const Label = z.string().trim().min(1).max(120);
const Description = z.string().trim().max(500);

/** A stable name for imports and integrations: letters, digits, `_ . -`. */
const Code = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[A-Za-z0-9_.-]+$/, 'letters, digits, _ . -');

const GroupId = z.object({ id: Id });

/** A new field group, added after the record type's others. */
export const DataExtensionFieldGroupCreate = z.object({
  recordType: DataExtensionRecordType,
  label: Label,
  code: Code,
  description: Description.optional(),
  appliesTo: AppliesTo.optional(),
});

/** A field group's changes. */
export const DataExtensionFieldGroupUpdate = GroupId.extend({
  label: Label.optional(),
  code: Code.optional(),
  description: Description.nullable().optional(),
  appliesTo: AppliesTo.optional(),
});

const base = dataExtensionsBase.errors({
  GROUP_IN_USE: ERRORS.GROUP_IN_USE,
  INVALID_FIELD_GROUP: ERRORS.INVALID_FIELD_GROUP,
});

/**
 * Field groups: the sections of a record type's fields. Every member reads them; changing them
 * needs `properties.manage`. A field names its group with `groupId`.
 */
export const dataFieldGroupsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/data-field-groups',
      summary: 'List a record type’s field groups',
      description:
        'The field groups of a record type, in their order. `archived: true` lists the archived ones instead.',
    })
    .input(z.object({ recordType: DataExtensionRecordType, archived: QueryBoolean.optional() }))
    .output(listOf(DataExtensionFieldGroup)),
  create: base
    .route({
      method: 'POST',
      path: '/data-field-groups',
      successStatus: 201,
      summary: 'Add a field group',
      description:
        'Adds a group after the record type’s others. 409 TAKEN for a code the record type has; 400 INVALID_FIELD_GROUP for `appliesTo` on a record type that isn’t a plugin’s.',
    })
    .input(DataExtensionFieldGroupCreate)
    .output(DataExtensionFieldGroup),
  update: base
    .route({
      method: 'PATCH',
      path: '/data-field-groups/{id}',
      summary: 'Change a field group',
      description:
        'Renames a group, changes its code or description, or the records it applies to.',
    })
    .input(DataExtensionFieldGroupUpdate)
    .output(DataExtensionFieldGroup),
  reorder: base
    .route({
      method: 'POST',
      path: '/data-field-groups/reorder',
      summary: 'Reorder a record type’s field groups',
      description: 'Puts a record type’s groups in the order of `ids` and answers them in it.',
    })
    .input(z.object({ recordType: DataExtensionRecordType, ids: z.array(Id).min(1).max(200) }))
    .output(listOf(DataExtensionFieldGroup)),
  archive: base
    .route({
      method: 'POST',
      path: '/data-field-groups/{id}/archive',
      summary: 'Archive a field group',
      description: 'Hides a group and its fields. Their values stay.',
    })
    .input(GroupId)
    .output(DataExtensionFieldGroup),
  restore: base
    .route({
      method: 'POST',
      path: '/data-field-groups/{id}/restore',
      summary: 'Restore an archived field group',
      description: 'Brings back an archived group and its fields.',
    })
    .input(GroupId)
    .output(DataExtensionFieldGroup),
  remove: base
    .route({
      method: 'DELETE',
      path: '/data-field-groups/{id}',
      summary: 'Delete an empty field group',
      description:
        'Deletes a group with no fields. 409 GROUP_IN_USE while any field, archived ones too, is in it.',
    })
    .input(GroupId)
    .output(z.object({ id: Id })),
};
