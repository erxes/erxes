import { NOTIFICATION_PRIORITIES } from '@erxes/core-db/enums';
import { notifications } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { NotificationDelivery } from './values';
import { cursorPageOf, CursorQuery, Id, isoDate } from './common';
import { ActorRef, AppLink, DedupeKey, EntityRef, EventType } from './platform';

export const Notification = createSelectSchema(notifications, {
  id: Id,
  data: z.record(z.string(), z.unknown()),
  createdAt: isoDate,
})
  .pick({
    id: true,
    /** `core` or the plugin that sent it. */
    source: true,
    kind: true,
    title: true,
    body: true,
    link: true,
    /** Details to show when opened; core's `*.updated` kinds carry `{ changes: { field: [before, after] } }`. */
    data: true,
    priority: true,
    createdAt: true,
  })
  .extend({ entity: EntityRef.nullable(), actor: ActorRef, read: z.boolean() });

export type Notification = z.infer<typeof Notification>;

export const NotificationInput = createUpdateSchema(notifications, {
  kind: () => EventType,
  title: (title) => title.trim().min(1).max(200),
  body: z.string().trim().max(2000).optional(),
  link: AppLink.optional(),
  data: () =>
    z
      .record(z.string(), z.unknown())
      .refine((value) => JSON.stringify(value).length <= 8_000, 'at most 8 KB'),
  priority: z.enum(NOTIFICATION_PRIORITIES).default('normal'),
  dedupeKey: DedupeKey.optional(),
})
  .pick({
    /** Must start with the plugin's name: `hr.leave.requested`. */
    kind: true,
    title: true,
    body: true,
    link: true,
    /** Details to show when opened (at most a few KB). */
    data: true,
    priority: true,
    /** Retry-safe: one notification per recipient and key. */
    dedupeKey: true,
  })
  .required({ kind: true, title: true })
  .extend({
    /** Team members to notify (active members of the organisation). */
    userIds: z.array(Id).min(1).max(500),
    entity: EntityRef.optional(),
    /** The team member who caused it, if any (shown as the sender). */
    actorUserId: Id.optional(),
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
  'core.note.mentioned',
  'core.automation.message',
  'core.automation.failed',
  'core.security.mass_deletion',
  'core.security.alert',
  'core.import.done',
  'core.export.ready',
  'core.security.new_sign_in',
] as const;

export type CoreNotificationKind = (typeof CORE_NOTIFICATION_KINDS)[number];

export const NotificationGroupSetting = z.object({
  key: z.string(),
  label: z.string(),
  /** A plugin's group (its whole inbox). */
  plugin: z.boolean(),
  /** Always on (security). */
  locked: z.boolean(),
  delivery: NotificationDelivery,
});

export const NotificationSettings = z.object({
  groups: z.array(NotificationGroupSetting),
  /** Emails for the groups set to the inbox and email. */
  email: z.boolean(),
  /** Desktop notifications in this member's browsers (each browser also asks permission). */
  browser: z.boolean(),
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
      summary:
        'My unread notifications, in total and per inbox (core and each plugin); `source` for one inbox',
    })
    .input(z.object({ source: z.string().trim().max(40).optional() }))
    .output(z.object({ count: z.int(), bySource: z.record(z.string(), z.int()) })),
  markRead: oc
    .route({
      method: 'POST',
      path: '/notifications/read',
      summary:
        'Mark some (`ids`), one inbox’s (`source`) or all of my notifications read, or unread with `read: false`',
    })
    .input(
      z.object({
        ids: z.array(Id).max(200).optional(),
        source: z.string().trim().max(40).optional(),
        read: z.boolean().default(true),
      }),
    )
    .output(z.object({ updated: z.int() })),
  remove: oc
    .route({
      method: 'DELETE',
      path: '/notifications/{id}',
      summary: 'Remove one of my notifications',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  settings: oc
    .route({ method: 'GET', path: '/notifications/settings', summary: 'My notification settings' })
    .output(NotificationSettings),
  updateSettings: oc
    .route({
      method: 'PUT',
      path: '/notifications/settings',
      summary: 'Where each group of notifications goes, and the email and browser switches',
    })
    .input(
      z.object({
        groups: z.record(z.string().regex(/^[a-z][a-z0-9_]*$/), NotificationDelivery).optional(),
        email: z.boolean().optional(),
        browser: z.boolean().optional(),
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
    .output(z.object({ created: z.int(), skipped: z.int() })),
};
