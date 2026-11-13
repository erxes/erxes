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
  data: z.record(z.string(), z.unknown()),
  priority: z.enum(['normal', 'high']),
  actor: ActorRef,
  read: z.boolean(),
  createdAt: z.iso.datetime(),
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
    .record(z.string(), z.unknown())
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

/** Security notices a member can't mute. */
export const UNMUTABLE_NOTIFICATION_KINDS: readonly string[] = [
  'core.user.role_changed',
  'core.user.password_set',
  'core.security.mass_deletion',
  'core.security.alert',
  'core.security.new_sign_in',
];

/** Where a group of notifications goes: the inbox and email, the inbox only, or nowhere. */
export const NotificationDelivery = z.enum(['email', 'inbox', 'off']);

export type NotificationDelivery = z.infer<typeof NotificationDelivery>;

/**
 * Core's notifications in groups a member chooses for at once (each plugin
 * is a group of its own). `security` is always on.
 */
export const CORE_NOTIFICATION_GROUPS = [
  {
    key: 'assigned',
    label: 'Assigned to me',
    kinds: ['core.customer.assigned', 'core.company.assigned'],
    default: 'email',
  },
  {
    key: 'records',
    label: 'Changes to records I own',
    kinds: [
      'core.customer.updated',
      'core.customer.merged',
      'core.customer.deleted',
      'core.company.updated',
      'core.company.merged',
      'core.company.deleted',
      'core.customer.activity',
      'core.company.activity',
    ],
    default: 'inbox',
  },
  { key: 'mentions', label: 'Mentions', kinds: ['core.note.mentioned'], default: 'email' },
  {
    key: 'automations',
    label: 'Automations',
    kinds: ['core.automation.message', 'core.automation.failed'],
    default: 'inbox',
  },
  {
    key: 'transfer',
    label: 'Imports and exports',
    kinds: ['core.import.done', 'core.export.ready'],
    default: 'inbox',
  },
  { key: 'security', label: 'Security', kinds: UNMUTABLE_NOTIFICATION_KINDS, default: 'inbox' },
] as const satisfies readonly {
  key: string;
  label: string;
  kinds: readonly string[];
  default: NotificationDelivery;
}[];

/** The group a notification belongs to: a core group, or the plugin that sent it. */
export const notificationGroupOf = (source: string, kind: string) =>
  source === 'core'
    ? (CORE_NOTIFICATION_GROUPS.find((group) => (group.kinds as readonly string[]).includes(kind))
        ?.key ?? 'records')
    : source;

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
