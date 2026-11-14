import { CONTENT_TYPES } from '@erxes/core-db/enums';
import { trash } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id, isoDate } from './common';

export const TrashItem = createSelectSchema(trash, {
  id: Id,
  recordId: Id,
  deletedAt: isoDate,
  purgeAt: isoDate,
})
  .pick({
    id: true,
    recordType: true,
    recordId: true,
    label: true,
    /** Who deleted it: a team member (`deletedBy` = user id), a plugin (its name) or `system`. */
    deletedByType: true,
    deletedBy: true,
    deletedAt: true,
    /** When it is gone for good. */
    purgeAt: true,
  })
  .extend({
    /** What comes back with it, counted in the query. */
    counts: z.object({
      tags: z.int(),
      links: z.int(),
      activities: z.int(),
    }),
  });

export type TrashItem = z.infer<typeof TrashItem>;

const { LIMIT_EXCEEDED, NOTHING_TO_RETRY, SUBJECT_REQUIRED } = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({ ...COMMON_ERRORS, LIMIT_EXCEEDED, NOTHING_TO_RETRY, SUBJECT_REQUIRED });

/**
 * The recycle bin: deleted customers and companies stay restorable for 30
 * days — with their tags, links and timeline — then are purged for good.
 */
export const trashContract = {
  list: base
    .route({
      method: 'GET',
      path: '/trash',
      summary: 'Deleted customers and companies, newest first (contacts.delete)',
    })
    .input(
      CursorQuery.extend({
        type: z.enum(CONTENT_TYPES).optional(),
        limit: z.coerce.number().int().min(1).max(500).default(100),
      }),
    )
    .output(cursorPageOf(TrashItem)),
  restore: base
    .route({
      method: 'POST',
      path: '/trash/restore',
      summary:
        'Bring records back with their tags, links and timeline (409 when an email or phone is taken now)',
    })
    .input(z.object({ ids: z.array(Id).min(1).max(500) }))
    .output(
      z.object({
        restored: z.int(),
        failed: z.array(z.object({ id: Id, reason: z.string() })),
      }),
    ),
  purge: base
    .route({
      method: 'POST',
      path: '/trash/purge',
      summary: 'Delete for good now (privacy requests; owners)',
    })
    .input(z.object({ ids: z.array(Id).min(1).max(500) }))
    .output(z.object({ purged: z.int() })),
};
