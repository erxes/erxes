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
  /** Details to show when opened; core's `*.updated` kinds carry `{ changes: { field: [before, after] } }`. */
  data: z.record(z.unknown()),
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
  /** Details to show when opened (at most a few KB). */
  data: z
    .record(z.unknown())
    .refine((value) => JSON.stringify(value).length <= 8_000, 'at most 8 KB')
    .optional(),
  priority: z.enum(['normal', 'high']).default('normal'),
  /** The team member who caused it, if any (shown as the sender). */
  actorUserId: Id.optional(),
  /** Retry-safe: one notification per recipient and key. */
  dedupeKey: DedupeKey.optional(),
});
export type NotificationInput = z.infer<typeof NotificationInput>;

/**
 * Notifications core sends itself. Members mute any of them, or a plugin's
 * notifications by its name, in their notification settings.
 */
export const CORE_NOTIFICATION_KINDS = [
  'core.customer.assigned',
  'core.customer.updated',
  'core.customer.merged',
  'core.customer.deleted',
  'core.customer.activity',
  'core.company.assigned',
  'core.company.updated',
  'core.company.merged',
  'core.company.deleted',
  'core.company.activity',
  'core.user.role_changed',
  'core.user.password_set',
] as const;
export type CoreNotificationKind = (typeof CORE_NOTIFICATION_KINDS)[number];

/** Security notices a member can't mute. */
export const UNMUTABLE_NOTIFICATION_KINDS: readonly string[] = ['core.user.role_changed', 'core.user.password_set'];

export const NotificationSettings = z.object({
  /** Muted kinds (`core.customer.updated`) and plugins (`hr`). */
  muted: z.array(z.string()),
  /** Plugins that have notified this member, to offer muting them. */
  sources: z.array(z.string()),
});
export type NotificationSettings = z.infer<typeof NotificationSettings>;

const boolQuery = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional();

/** The signed-in member's inbox. Plugins create notifications with `create`. */
export const notificationsContract = {
  list: oc
    .route({ method: 'GET', path: '/notifications', summary: 'My notifications, newest first' })
    .input(
      CursorQuery.extend({
        unread: boolQuery,
        source: z.string().trim().max(40).optional(),
        priority: z.enum(['normal', 'high']).optional(),
        /** A kind, or a prefix ending in `.` or `*` (`core.customer.`). */
        kind: z.string().trim().max(100).optional(),
      }),
    )
    .output(cursorPageOf(Notification)),
  unreadCount: oc
    .route({
      method: 'GET',
      path: '/notifications/unread-count',
      summary: 'My unread notifications, in total and per inbox (core and each plugin); `source` for one inbox',
    })
    .input(z.object({ source: z.string().trim().max(40).optional() }))
    .output(z.object({ count: z.number().int(), bySource: z.record(z.number().int()) })),
  markRead: oc
    .route({
      method: 'POST',
      path: '/notifications/read',
      summary: 'Mark some (`ids`), one inbox’s (`source`) or all of my notifications read, or unread with `read: false`',
    })
    .input(
      z.object({
        ids: z.array(Id).max(200).optional(),
        source: z.string().trim().max(40).optional(),
        read: z.boolean().default(true),
      }),
    )
    .output(z.object({ updated: z.number().int() })),
  remove: oc
    .route({ method: 'DELETE', path: '/notifications/{id}', summary: 'Remove one of my notifications' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  settings: oc
    .route({ method: 'GET', path: '/notifications/settings', summary: 'My notification settings' })
    .output(NotificationSettings),
  updateSettings: oc
    .route({ method: 'PUT', path: '/notifications/settings', summary: 'Mute or unmute kinds of notifications' })
    .input(
      z.object({
        muted: z
          .array(z.string().trim().min(1).max(100).regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/, 'a kind or plugin name'))
          .max(200),
      }),
    )
    .output(NotificationSettings),
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
