import { oc } from '@orpc/contract';
import { z } from 'zod';
import { ContentType, Id } from './common';

export const FieldType = z.enum(['text', 'textarea', 'number', 'date', 'boolean', 'select', 'multiselect']);
export type FieldType = z.infer<typeof FieldType>;

/** A custom field ("property") on customers or companies. */
export const Field = z.object({
  id: Id,
  contentType: ContentType,
  label: z.string(),
  type: FieldType,
  /** Choices for select / multiselect. */
  options: z.array(z.string()),
  order: z.number().int(),
  createdAt: z.string().datetime(),
});
export type Field = z.infer<typeof Field>;

const options = z.array(z.string().trim().min(1).max(200)).max(100);

const changes = (value: Record<string, unknown>) => Object.keys(value).some((key) => key !== 'id');

export const fieldsContract = {
  list: oc
    .route({ method: 'GET', path: '/fields', summary: 'Custom fields of a record type, in order' })
    .input(z.object({ contentType: ContentType }))
    .output(z.object({ data: z.array(Field) })),
  create: oc
    .route({
      method: 'POST',
      path: '/fields',
      successStatus: 201,
      summary: 'Add a custom field (owners and admins). 409 FIELD_EXISTS for a taken label',
    })
    .input(
      z
        .object({
          contentType: ContentType,
          label: z.string().trim().min(1).max(100),
          type: FieldType,
          options: options.optional(),
        })
        .refine(
          (value) => !['select', 'multiselect'].includes(value.type) || (value.options?.length ?? 0) > 0,
          { message: 'select fields need options', path: ['options'] },
        ),
    )
    .output(Field),
  update: oc
    .route({
      method: 'PATCH',
      path: '/fields/{id}',
      summary: 'Rename, reorder or change options (the type is fixed)',
    })
    .input(
      z
        .object({
          id: Id,
          label: z.string().trim().min(1).max(100).optional(),
          options: options.optional(),
          order: z.number().int().min(0).max(10_000).optional(),
        })
        .refine(changes, 'nothing to update'),
    )
    .output(Field),
  remove: oc
    .route({
      method: 'DELETE',
      path: '/fields/{id}',
      summary: 'Delete a custom field and its values (owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
