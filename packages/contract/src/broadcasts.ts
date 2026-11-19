import { broadcastRecipients, broadcasts } from '@erxes/core-db/schema';
import { ConditionGroup } from '@erxes/core-db/automationDefinition';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, EmailAddress, Id, isoDate } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { BroadcastChannel, BroadcastRecipientStatus, BroadcastStatus } from './values';

/** Where a broadcast's copies stand, counted from its recipients. */
export const BroadcastStats = z.object({
  queued: z.int(),
  sending: z.int(),
  sent: z.int(),
  failed: z.int(),
  skipped: z.int(),
  /** Email: recipients who opened it at least once (pictures shown). */
  opened: z.int(),
  /** Recipients who followed a link in it. */
  clicked: z.int(),
  /** Recipients who unsubscribed through it. */
  unsubscribed: z.int(),
});

export type BroadcastStats = z.infer<typeof BroadcastStats>;

export const Broadcast = createSelectSchema(broadcasts, {
  id: Id,
  filter: () => ConditionGroup,
  scheduledAt: isoDate,
  startedAt: isoDate,
  finishedAt: isoDate,
  createdAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    id: true,
    name: true,
    channel: true,
    status: true,
    /** A saved customer view: its filter as it stands when sending starts. */
    viewId: true,
    /** The broadcast's own audience filter. No view and no filter: every customer. */
    filter: true,
    subject: true,
    preheader: true,
    /** Markdown for email, text for SMS; `{{ firstName | there }}` fills in each customer's value. */
    body: true,
    fromName: true,
    /** Email: a confirmed sender's address it goes out as; null: the organisation's sending address. */
    fromEmail: true,
    replyTo: true,
    scheduledAt: true,
    startedAt: true,
    finishedAt: true,
    error: true,
    /** Recipients frozen when sending started. */
    total: true,
    createdBy: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({ stats: BroadcastStats });

export type Broadcast = z.infer<typeof Broadcast>;

const BroadcastFields = createUpdateSchema(broadcasts, {
  name: (name) => name.trim().min(1).max(120),
  viewId: () => Id.nullable(),
  filter: () => ConditionGroup.nullable(),
  subject: (subject) => subject.trim().max(200).nullable(),
  preheader: (preheader) => preheader.trim().max(200).nullable(),
  body: (body) => body.max(50_000),
  fromName: (name) =>
    name
      .trim()
      .max(80)
      .regex(/^[^<>"\r\n]*$/, 'no quotes, brackets or line breaks')
      .nullable(),
  fromEmail: () => EmailAddress.nullable(),
  replyTo: () => EmailAddress.nullable(),
}).pick({
  name: true,
  viewId: true,
  filter: true,
  subject: true,
  preheader: true,
  body: true,
  fromName: true,
  fromEmail: true,
  replyTo: true,
});

const oneAudience = (value: { viewId?: string | null; filter?: unknown }) =>
  !(value.viewId && value.filter);

export const BroadcastCreate = BroadcastFields.required({ name: true })
  .extend({ channel: BroadcastChannel })
  .refine(oneAudience, 'a view or a filter, not both');

export const BroadcastUpdate = BroadcastFields.extend({ id: Id }).refine(
  oneAudience,
  'a view or a filter, not both',
);

/** Who a broadcast would reach now. */
export const BroadcastAudience = z.object({
  /** Customers the audience matches. */
  matched: z.int(),
  /** Of them, those with an address on the channel that isn't suppressed (one per address). */
  reachable: z.int(),
  /** Matched customers with no email (or phone) at all. */
  noAddress: z.int(),
  /** Matched customers whose address unsubscribed, bounced or was added by a member. */
  suppressed: z.int(),
});

export const BroadcastRecipient = createSelectSchema(broadcastRecipients, {
  id: Id,
  sentAt: isoDate,
  openedAt: isoDate,
  clickedAt: isoDate,
  unsubscribedAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    id: true,
    customerId: true,
    address: true,
    status: true,
    /** Why it failed or wasn't sent. */
    reason: true,
    attempts: true,
    sentAt: true,
    openedAt: true,
    clickedAt: true,
    unsubscribedAt: true,
    updatedAt: true,
  })
  .extend({ customerName: z.string().nullable() });

export type BroadcastRecipient = z.infer<typeof BroadcastRecipient>;

/** One customer's copy as it would be sent (`text` only for SMS). */
export const BroadcastRendered = z.object({
  to: z.string().nullable(),
  subject: z.string().nullable(),
  html: z.string().nullable(),
  text: z.string(),
});

const {
  BROADCAST_STATUS,
  BROADCAST_INCOMPLETE,
  UNKNOWN_PLACEHOLDER,
  NO_RECIPIENTS,
  INVALID_TYPE,
  SENDER_NOT_CONFIRMED,
} = ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  BROADCAST_STATUS,
  BROADCAST_INCOMPLETE,
  UNKNOWN_PLACEHOLDER,
  NO_RECIPIENTS,
  INVALID_TYPE,
  SENDER_NOT_CONFIRMED,
});

const ById = z.object({ id: Id });

/** Email and SMS to many customers at once (decision 47). */
export const broadcastsContract = {
  list: base
    .route({ method: 'GET', path: '/broadcasts', summary: 'Broadcasts, newest first' })
    .input(
      CursorQuery.extend({
        status: BroadcastStatus.optional(),
        channel: BroadcastChannel.optional(),
        search: z.string().trim().max(100).optional(),
      }),
    )
    .output(cursorPageOf(Broadcast)),
  get: base.route({ method: 'GET', path: '/broadcasts/{id}' }).input(ById).output(Broadcast),
  create: base
    .route({
      method: 'POST',
      path: '/broadcasts',
      successStatus: 201,
      summary:
        'Write a broadcast (a draft). 400 UNKNOWN_PLACEHOLDER for a `{{ … }}` erxes can’t fill, 400 SENDER_NOT_CONFIRMED for a sender that isn’t confirmed',
    })
    .input(BroadcastCreate)
    .output(Broadcast),
  update: base
    .route({
      method: 'PATCH',
      path: '/broadcasts/{id}',
      summary:
        'Change a draft or scheduled broadcast; 409 BROADCAST_STATUS once it has started, 400 SENDER_NOT_CONFIRMED for a sender that isn’t confirmed',
    })
    .input(BroadcastUpdate)
    .output(Broadcast),
  remove: base
    .route({
      method: 'DELETE',
      path: '/broadcasts/{id}',
      summary:
        'Delete a broadcast that is not going out (draft, scheduled, sent, cancelled, failed)',
    })
    .input(ById)
    .output(z.object({ ok: z.literal(true) })),
  duplicate: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/duplicate',
      successStatus: 201,
      summary: 'A new draft with the same audience and content',
    })
    .input(ById)
    .output(Broadcast),
  audience: base
    .route({
      method: 'POST',
      path: '/broadcasts/audience',
      summary: 'Who an audience (a view, a filter, or everyone) would reach on a channel now',
    })
    .input(
      z
        .object({
          channel: BroadcastChannel,
          viewId: Id.nullable().optional(),
          filter: ConditionGroup.nullable().optional(),
        })
        .refine(oneAudience, 'a view or a filter, not both'),
    )
    .output(BroadcastAudience),
  preview: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/preview',
      summary:
        "The broadcast as one customer would get it (`customerId`, else the audience's first customer, else sample values)",
    })
    .input(ById.extend({ customerId: Id.optional() }))
    .output(BroadcastRendered),
  test: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/test',
      successStatus: 202,
      summary:
        'Send the broadcast to up to 5 addresses (emails or phones, by channel) with sample values; not counted',
    })
    .input(ById.extend({ to: z.array(z.string().trim().min(3).max(254)).min(1).max(5) }))
    .output(z.object({ queued: z.int() })),
  send: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/send',
      summary:
        'Start sending now: the audience is frozen and goes out at the deployment’s pace. 409 NO_RECIPIENTS when nobody is reachable',
    })
    .input(ById)
    .output(Broadcast),
  schedule: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/schedule',
      summary: 'Send at `at` (in the future); the audience is frozen then',
    })
    .input(ById.extend({ at: z.iso.datetime({ offset: true }) }))
    .output(Broadcast),
  unschedule: base
    .route({ method: 'POST', path: '/broadcasts/{id}/unschedule', summary: 'Back to a draft' })
    .input(ById)
    .output(Broadcast),
  pause: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/pause',
      summary: 'Stop sending after the copies already being sent',
    })
    .input(ById)
    .output(Broadcast),
  resume: base
    .route({ method: 'POST', path: '/broadcasts/{id}/resume' })
    .input(ById)
    .output(Broadcast),
  cancel: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/cancel',
      summary: 'Stop for good; recipients not yet sent to are skipped',
    })
    .input(ById)
    .output(Broadcast),
  recipients: base
    .route({
      method: 'GET',
      path: '/broadcasts/{id}/recipients',
      summary: "A broadcast's recipients and what became of each",
    })
    .input(
      CursorQuery.extend({
        id: Id,
        status: BroadcastRecipientStatus.optional(),
        search: z.string().trim().max(100).optional(),
      }),
    )
    .output(cursorPageOf(BroadcastRecipient)),
};
