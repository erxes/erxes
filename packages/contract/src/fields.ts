import { oc } from '@orpc/contract';
import { z } from 'zod';
import { ContentType, Id, IdList, QueryBoolean } from './common';

export const FieldType = z.enum([
  'text',
  'textarea',
  'number',
  'date',
  'boolean',
  'select',
  'multiselect',
  'radio',
  'check',
  'phone',
  'list',
]);

export type FieldType = z.infer<typeof FieldType>;

/** Field types whose values are chosen from `options`. */
export const OPTION_FIELD_TYPES: readonly FieldType[] = ['select', 'multiselect', 'radio', 'check'];

/**
 * Types sharing a stored value: a field holding values may only change within
 * its family; an unused field may become any type.
 */
export const FIELD_TYPE_FAMILIES: readonly (readonly FieldType[])[] = [
  ['select', 'radio'],
  ['multiselect', 'check'],
  ['text', 'textarea', 'phone'],
];

/** Format a text field's values must have. */
export const FieldValidation = z.enum(['number', 'email', 'date']);

export type FieldValidation = z.infer<typeof FieldValidation>;

/** A custom field ("property") on customers or companies. */
export const Field = z.object({
  id: Id,
  contentType: ContentType,
  /** The group it is listed in; `null` for fields made before groups. */
  groupId: Id.nullable(),
  label: z.string(),
  /** A stable key for integrations. */
  code: z.string().nullable(),
  description: z.string().nullable(),
  /** A Tabler icon name. */
  icon: z.string().nullable(),
  type: FieldType,
  /** Format text values must have. */
  validation: FieldValidation.nullable(),
  /** Choices for select / multiselect / radio / check. */
  options: z.array(z.string()),
  /** Shown in record tables and the record panel. */
  isVisible: z.boolean(),
  order: z.number().int(),
  /** Set while it (or its group) is archived: hidden, values kept. */
  archivedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type Field = z.infer<typeof Field>;

/** A group of custom fields of a record type. */
export const FieldGroup = z.object({
  id: Id,
  contentType: ContentType,
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  order: z.number().int(),
  archivedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type FieldGroup = z.infer<typeof FieldGroup>;

/** Whether records hold values of the fields asked about. */
export const FieldUsage = z.object({
  /** Records holding a value of any of them. */
  records: z.number().int(),
  /** Records holding each option, per field id (option fields only). */
  options: z.record(Id, z.record(z.string(), z.number().int())),
  /** Nothing holds a value, so they can be deleted. */
  removable: z.boolean(),
});

export type FieldUsage = z.infer<typeof FieldUsage>;

const options = z.array(z.string().trim().min(1).max(200)).max(100);

const code = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[A-Za-z0-9_.-]+$/, 'letters, digits, _ . -');

const description = z.string().trim().max(1000);
const icon = z.string().trim().max(100);

const Orders = z.object({
  orders: z
    .array(z.object({ id: Id, order: z.number().int().min(0).max(100_000) }))
    .min(1)
    .max(500),
});

const Ok = z.object({ ok: z.literal(true) });

const changes = (value: Record<string, unknown>) => Object.keys(value).some((key) => key !== 'id');

const needsOptions = (value: { type?: FieldType; options?: string[] }) =>
  !value.type || !OPTION_FIELD_TYPES.includes(value.type) || (value.options?.length ?? 0) > 0;

export const fieldsContract = {
  list: oc
    .route({
      method: 'GET',
      path: '/fields',
      summary:
        'Custom fields of a record type, in order. Archived ones (or those of an archived group) only with `archived=true`',
    })
    .input(
      z.object({
        contentType: ContentType,
        groupId: Id.optional(),
        archived: QueryBoolean.optional(),
      }),
    )
    .output(z.object({ data: z.array(Field) })),
  usage: oc
    .route({
      method: 'GET',
      path: '/fields/usage',
      summary: 'How many records hold values of the given fields (or of a group’s fields)',
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
  create: oc
    .route({
      method: 'POST',
      path: '/fields',
      successStatus: 201,
      summary: 'Add a custom field (owners and admins). 409 FIELD_EXISTS for a taken label or code',
    })
    .input(
      z
        .object({
          contentType: ContentType,
          label: z.string().trim().min(1).max(100),
          type: FieldType,
          options: options.optional(),
          groupId: Id.nullable().optional(),
          code: code.nullable().optional(),
          description: description.nullable().optional(),
          icon: icon.nullable().optional(),
          validation: FieldValidation.nullable().optional(),
          isVisible: z.boolean().optional(),
        })
        .refine(needsOptions, { message: 'select fields need options', path: ['options'] }),
    )
    .output(Field),
  update: oc
    .route({
      method: 'PATCH',
      path: '/fields/{id}',
      summary:
        'Change a field. The type changes only within types sharing a stored value while records hold values (409 FIELD_IN_USE)',
    })
    .input(
      z
        .object({
          id: Id,
          label: z.string().trim().min(1).max(100).optional(),
          type: FieldType.optional(),
          options: options.optional(),
          order: z.number().int().min(0).max(100_000).optional(),
          groupId: Id.nullable().optional(),
          code: code.nullable().optional(),
          description: description.nullable().optional(),
          icon: icon.nullable().optional(),
          validation: FieldValidation.nullable().optional(),
          isVisible: z.boolean().optional(),
        })
        .refine(changes, 'nothing to update'),
    )
    .output(Field),
  reorder: oc
    .route({
      method: 'POST',
      path: '/fields/order',
      summary: 'Set the order of fields (owners and admins)',
    })
    .input(Orders)
    .output(Ok),
  archive: oc
    .route({
      method: 'POST',
      path: '/fields/archive',
      summary: 'Archive fields: hidden everywhere, values kept (owners and admins)',
    })
    .input(z.object({ ids: z.array(Id).min(1).max(100) }))
    .output(Ok),
  restore: oc
    .route({
      method: 'POST',
      path: '/fields/{id}/restore',
      summary: 'Restore an archived field (owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(Field),
  removeUnused: oc
    .route({
      method: 'POST',
      path: '/fields/remove',
      summary:
        'Delete fields no record holds a value of (owners and admins). 409 FIELD_IN_USE otherwise',
    })
    .input(z.object({ ids: z.array(Id).min(1).max(100) }))
    .output(Ok),
  remove: oc
    .route({
      method: 'DELETE',
      path: '/fields/{id}',
      summary: 'Delete a custom field and its values (owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(Ok),
};

export const fieldGroupsContract = {
  list: oc
    .route({
      method: 'GET',
      path: '/field-groups',
      summary: 'Field groups of a record type, in order. Archived ones only with `archived=true`',
    })
    .input(z.object({ contentType: ContentType, archived: QueryBoolean.optional() }))
    .output(z.object({ data: z.array(FieldGroup) })),
  create: oc
    .route({
      method: 'POST',
      path: '/field-groups',
      successStatus: 201,
      summary:
        'Add a field group (owners and admins). The code defaults to the name; 409 FIELD_GROUP_EXISTS for a taken code',
    })
    .input(
      z.object({
        contentType: ContentType,
        name: z.string().trim().min(1).max(100),
        code: code.optional(),
        description: description.nullable().optional(),
      }),
    )
    .output(FieldGroup),
  update: oc
    .route({
      method: 'PATCH',
      path: '/field-groups/{id}',
      summary: 'Rename a field group (owners and admins)',
    })
    .input(
      z
        .object({
          id: Id,
          name: z.string().trim().min(1).max(100).optional(),
          code: code.optional(),
          description: description.nullable().optional(),
          order: z.number().int().min(0).max(100_000).optional(),
        })
        .refine(changes, 'nothing to update'),
    )
    .output(FieldGroup),
  reorder: oc
    .route({
      method: 'POST',
      path: '/field-groups/order',
      summary: 'Set the order of field groups (owners and admins)',
    })
    .input(Orders)
    .output(Ok),
  archive: oc
    .route({
      method: 'POST',
      path: '/field-groups/{id}/archive',
      summary: 'Archive a group: it and its fields are hidden, values kept (owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(FieldGroup),
  restore: oc
    .route({
      method: 'POST',
      path: '/field-groups/{id}/restore',
      summary: 'Restore an archived group (owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(FieldGroup),
  remove: oc
    .route({
      method: 'DELETE',
      path: '/field-groups/{id}',
      summary:
        'Delete a group and its fields when no record holds their values (owners and admins). 409 FIELD_IN_USE otherwise',
    })
    .input(z.object({ id: Id }))
    .output(Ok),
};
