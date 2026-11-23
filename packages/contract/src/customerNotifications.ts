import { CUSTOMER_NOTIFICATION_CHANNELS } from '@erxes/core-db/enums';
import { customerNotifications } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, Id, isoDate, QueryFlag } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { MarkReadInput } from './notifications';
import { AppLink, DedupeKey, EntityType, EventType } from './platform';

export const CustomerNotificationChannel = z.enum(CUSTOMER_NOTIFICATION_CHANNELS);

/** One notification in a signed-in customer's inbox. */
export const CustomerNotification = createSelectSchema(customerNotifications, {
  id: Id,
  data: z.record(z.string(), z.unknown()),
  readAt: isoDate,
  createdAt: isoDate,
}).pick({
  id: true,
  /** The plugin that sent it. */
  source: true,
  kind: true,
  title: true,
  body: true,
  /** The website it is for; null: every website. */
  websiteId: true,
  /** A path on the website. */
  link: true,
  data: true,
  entityType: true,
  entityId: true,
  /** Null while unread. */
  readAt: true,
  createdAt: true,
});

export type CustomerNotification = z.infer<typeof CustomerNotification>;

export const CustomerNotificationInput = createUpdateSchema(customerNotifications, {
  kind: () => EventType,
  title: (title) => title.trim().min(1).max(200),
  body: z.string().trim().max(2000).optional(),
  link: AppLink.optional(),
  data: () =>
    z
      .record(z.string(), z.unknown())
      .refine((value) => JSON.stringify(value).length <= 8_000, 'at most 8 KB'),
  dedupeKey: DedupeKey.optional(),
  entityType: EntityType.optional(),
  entityId: Id.optional(),
})
  .pick({
    /** Must start with the plugin's name: `content.post.published`. */
    kind: true,
    title: true,
    body: true,
    /** A path on `websiteId`'s website; emails link to it there. */
    link: true,
    data: true,
    /** Retry-safe: one notification per customer and key. */
    dedupeKey: true,
    entityType: true,
    entityId: true,
  })
  .required({ kind: true, title: true })
  .extend({
    /**
     * One of the plugin's websites: the notification shows there only, `everyone` is its
     * accounts, and emails link into it. Without one it shows on every website.
     */
    websiteId: Id.optional(),
    /** The customers to notify. */
    customerIds: z.array(Id).min(1).max(500).optional(),
    /** Every customer with an account on the website (or on any website); inbox only. */
    everyone: z.literal(true).optional(),
    /** Also by email or SMS, to the customer's primary address, when they have one. */
    channels: z.array(CustomerNotificationChannel).max(2).default([]),
  })
  .refine(
    (value) => (value.customerIds === undefined) !== (value.everyone === undefined),
    'customerIds or everyone',
  )
  .refine(
    (value) => !value.everyone || !value.channels.length,
    'everyone goes to inboxes only; name customerIds to email or text them',
  )
  .refine(
    (value) => (value.entityType === undefined) === (value.entityId === undefined),
    'entityType and entityId go together',
  )
  .refine(
    (value) => value.link === undefined || value.websiteId !== undefined,
    'a link is a path on a website: name websiteId',
  );

export type CustomerNotificationInput = z.infer<typeof CustomerNotificationInput>;

const { INVALID_RECIPIENT, INVALID_TYPE, UNKNOWN_WEBSITE } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, INVALID_RECIPIENT, INVALID_TYPE, UNKNOWN_WEBSITE });

/** Plugins notify customers; the customer reads them in the plugin's app (decision 45). */
export const customerNotificationsContract = {
  create: base
    .route({
      method: 'POST',
      path: '/customer-notifications',
      successStatus: 201,
      summary: 'Notify customers',
      description:
        'Notify customers (plugins only), in their inbox and, with `channels`, by email or SMS. 400 INVALID_RECIPIENT for unknown customers',
    })
    .input(CustomerNotificationInput)
    .output(z.object({ created: z.int(), skipped: z.int() })),
  list: base
    .route({
      method: 'GET',
      path: '/customer/notifications',
      summary: 'List customer notifications',
      description: "The signed-in customer's notifications, newest first",
    })
    .input(
      CursorQuery.extend({
        unread: QueryFlag.optional(),
        source: z.string().trim().max(40).optional(),
      }),
    )
    .output(cursorPageOf(CustomerNotification)),
  unreadCount: base
    .route({
      method: 'GET',
      path: '/customer/notifications/unread-count',
      summary: 'Count unread customer notifications',
      description: "The signed-in customer's unread notifications; `source` for one plugin's",
    })
    .input(z.object({ source: z.string().trim().max(40).optional() }))
    .output(z.object({ count: z.int() })),
  markRead: base
    .route({
      method: 'POST',
      path: '/customer/notifications/read',
      summary: 'Mark customer notifications read',
      description:
        'Mark some (`ids`) or all of my notifications read, or unread with `read: false`',
    })
    .input(MarkReadInput)
    .output(z.object({ updated: z.int() })),
};
