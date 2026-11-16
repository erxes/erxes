import { favorites } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';

/** The most favorites one member keeps. */
export const FAVORITES_MAX = 50;

export const Favorite = createSelectSchema(favorites, { id: Id, createdAt: isoDate }).pick({
  id: true,
  /** A web address from its first slash, with its query: `/contacts?view=…`. */
  path: true,
  label: true,
  /** Its place in the list, from 1. */
  position: true,
  createdAt: true,
});

export type Favorite = z.infer<typeof Favorite>;

const FavoriteFields = createUpdateSchema(favorites, {
  path: (path) =>
    path
      .trim()
      .max(500)
      .regex(/^\/[^/\s]\S*$/, 'a web address from its first slash, like /contacts?view=1'),
  label: (label) => label.trim().min(1).max(120),
}).pick({ path: true, label: true });

const { FAVORITE_LIMIT } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, FAVORITE_LIMIT });

/** The signed-in member's starred pages; nobody else sees them. */
export const favoritesContract = {
  list: base
    .route({ method: 'GET', path: '/favorites', summary: "The member's favorites, in their order" })
    .output(listOf(Favorite)),
  add: base
    .route({
      method: 'POST',
      path: '/favorites',
      successStatus: 201,
      summary: `Star a page, last in the list; a starred one keeps its place and takes the new label. 409 FAVORITE_LIMIT past ${FAVORITES_MAX}`,
    })
    .input(FavoriteFields.required({ path: true, label: true }))
    .output(Favorite),
  rename: base
    .route({ method: 'PATCH', path: '/favorites/{id}' })
    .input(FavoriteFields.pick({ label: true }).required().extend({ id: Id }))
    .output(Favorite),
  remove: base
    .route({ method: 'DELETE', path: '/favorites/{id}' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  reorder: base
    .route({
      method: 'PUT',
      path: '/favorites/order',
      summary: 'Put the favorites in this order; ones not named keep their order after them',
    })
    .input(z.object({ ids: z.array(Id).max(FAVORITES_MAX) }))
    .output(listOf(Favorite)),
};
