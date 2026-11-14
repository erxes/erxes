import { tags } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { ContentType, Id, isoDate, listOf } from './common';

export const Tag = createSelectSchema(tags, { id: Id, createdAt: isoDate }).pick({
  id: true,
  type: true,
  name: true,
  /** `#rrggbb` */
  colorCode: true,
  createdAt: true,
});

export type Tag = z.infer<typeof Tag>;

const TagFields = createUpdateSchema(tags, {
  name: (name) => name.trim().min(1).max(100),
  colorCode: (color) => color.regex(/^#[0-9a-fA-F]{6}$/, '#rrggbb'),
}).pick({ type: true, name: true, colorCode: true });

const { INVALID_TAG, TAG_LIMIT } = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({ ...COMMON_ERRORS, INVALID_TAG, TAG_LIMIT });

/** Labels for customers and companies. Plugins keep their own tags. */
export const tagsContract = {
  list: base
    .route({ method: 'GET', path: '/tags', summary: 'Tags of a record type, by name' })
    .input(z.object({ type: ContentType, search: z.string().trim().max(100).optional() }))
    .output(listOf(Tag)),
  create: base
    .route({
      method: 'POST',
      path: '/tags',
      successStatus: 201,
      summary:
        'Create a tag. 409 TAG_EXISTS when the name is taken for the type, 409 TAG_LIMIT when the type already has LIST_MAX (1000) tags',
    })
    .input(TagFields.required({ type: true, name: true }))
    .output(Tag),
  update: base
    .route({ method: 'PATCH', path: '/tags/{id}' })
    .input(
      TagFields.omit({ type: true })
        .extend({ id: Id })
        .refine((value) => Object.keys(value).some((key) => key !== 'id'), 'nothing to update'),
    )
    .output(Tag),
  remove: base
    .route({
      method: 'DELETE',
      path: '/tags/{id}',
      summary: 'Delete a tag; it comes off every record (owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
