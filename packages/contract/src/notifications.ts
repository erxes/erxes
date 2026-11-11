import { oc } from '@orpc/contract';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, Id } from './common';
import { ActorRef, AppLink, DedupeKey, EntityRef, EventType } from './platform';

export const Notification = z.object({
  id: Id,
  /** `core` or the plugin that sent it. */
  source: z.string(),
  kind: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  link: z.string().nullable(),
  entity: EntityRef.nullable(),
  priority: z.enum(['normal', 'high']),
  actor: ActorRef,
  read: z.boolean(),
  createdAt: z.string().datetime(),
});
export type Notification = z.infer<typeof Notification>;

export const NotificationInput = z.object({
  /** Team members to notify (active members of the organisation). */
  userIds: z.array(Id).min(1).max(500),
  /** Must start with the plugin's name: `hr.leave.requested`. */
  kind: EventType,
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(2000).optional(),
  link: AppLink.optional(),
  entity: EntityRef.optional(),
  priority: z.enum(['normal', 'high']).default('normal'),
  /** The team member who caused it, if any (shown as the sender). */
  actorUserId: Id.optional(),
  /** Retry-safe: one notification per recipient and key. */
  dedupeKey: DedupeKey.optional(),
});
export type NotificationInput = z.infer<typeof NotificationInput>;

const boolQuery = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional();

/** The signed-in member's inbox. Plugins create notifications with `create`. */
export const notificationsContract = {
  list: oc
    .route({ method: 'GET', path: '/notifications', summary: 'My notifications, newest first' })
    .input(CursorQuery.extend({ unread: boolQuery, source: z.string().trim().max(40).optional() }))
    .output(cursorPageOf(Notification)),
  unreadCount: oc
    .route({ method: 'GET', path: '/notifications/unread-count' })
    .output(z.object({ count: z.number().int() })),
  markRead: oc
    .route({
      method: 'POST',
      path: '/notifications/read',
      summary: 'Mark some (`ids`) or all of my notifications read, or unread with `read: false`',
    })
    .input(z.object({ ids: z.array(Id).max(200).optional(), read: z.boolean().default(true) }))
    .output(z.object({ updated: z.number().int() })),
  remove: oc
    .route({ method: 'DELETE', path: '/notifications/{id}', summary: 'Remove one of my notifications' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  create: oc
    .route({
      method: 'POST',
      path: '/notifications',
      successStatus: 201,
      summary:
        'Notify team members (plugins only). `kind` starts with the plugin name. 400 INVALID_RECIPIENT for unknown or inactive members',
    })
    .input(NotificationInput)
    .output(z.object({ created: z.number().int(), skipped: z.number().int() })),
};
