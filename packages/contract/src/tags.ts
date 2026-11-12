import { oc } from '@orpc/contract';
import { z } from 'zod';
import { ContentType, Id } from './common';

export const Tag = z.object({
  id: Id,
  type: ContentType,
  name: z.string(),
  /** `#rrggbb` */
  colorCode: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type Tag = z.infer<typeof Tag>;

const color = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, '#rrggbb')
  .nullable()
  .optional();

/** Labels for customers and companies. Plugins keep their own tags. */

/** Labels for customers and companies. Plugins keep their own tags. */
export const tagsContract = {
  list: oc
    .route({ method: 'GET', path: '/tags', summary: 'Tags of a record type, by name' })
    .input(z.object({ type: ContentType, search: z.string().trim().max(100).optional() }))
    .output(z.object({ data: z.array(Tag) })),
  create: oc
    .route({
      method: 'POST',
      path: '/tags',
      successStatus: 201,
      summary: 'Create a tag. 409 TAG_EXISTS when the name is taken for the type',
    })
    .input(
      z.object({ type: ContentType, name: z.string().trim().min(1).max(100), colorCode: color }),
    )
    .output(Tag),
  update: oc
    .route({ method: 'PATCH', path: '/tags/{id}' })
    .input(
      z
        .object({ id: Id, name: z.string().trim().min(1).max(100).optional(), colorCode: color })
        .refine((value) => Object.keys(value).some((key) => key !== 'id'), 'nothing to update'),
    )
    .output(Tag),
  remove: oc
    .route({
      method: 'DELETE',
      path: '/tags/{id}',
      summary: 'Delete a tag; it comes off every record (owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
