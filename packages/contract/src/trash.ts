import { oc } from '@orpc/contract';
import { z } from 'zod';
import { Id } from './common';

export const TrashItem = z.object({
  id: Id,
  recordType: z.enum(['customer', 'company']),
  recordId: Id,
  label: z.string().nullable(),
  deletedBy: z.object({ type: z.enum(['user', 'plugin', 'system']), id: z.string().nullable() }),
  deletedAt: z.iso.datetime(),
  /** When it is gone for good. */
  purgeAt: z.iso.datetime(),
  /** What comes back with it. */
  counts: z.object({
    tags: z.int(),
    links: z.int(),
    activities: z.int(),
  }),
});

export type TrashItem = z.infer<typeof TrashItem>;

/**
 * The recycle bin: deleted customers and companies stay restorable for 30
 * days — with their tags, links and timeline — then are purged for good.
 */
export const trashContract = {
  list: oc
    .route({
      method: 'GET',
      path: '/trash',
      summary: 'Deleted customers and companies, newest first (contacts.delete)',
    })
    .input(
      z.object({
        type: z.enum(['customer', 'company']).optional(),
        limit: z.coerce.number().int().min(1).max(500).default(100),
      }),
    )
    .output(z.object({ data: z.array(TrashItem) })),
  restore: oc
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
  purge: oc
    .route({
      method: 'POST',
      path: '/trash/purge',
      summary: 'Delete for good now (privacy requests; owners)',
    })
    .input(z.object({ ids: z.array(Id).min(1).max(500) }))
    .output(z.object({ purged: z.int() })),
};
