import { broadcasts } from '@erxes/core-db/schema';
import { ConditionGroup } from '@erxes/core-db/automationDefinition';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { BroadcastAudience, BroadcastRecipient, BroadcastRendered } from './broadcastRecipients';
import { cursorPageOf, CursorQuery, EmailAddress, Id, isoDate } from './common';
import { EmailDocument } from './emailDocument';
import { COMMON_ERRORS, ERRORS } from './errors';
import {
  BROADCAST_ATTACHMENTS_MAX,
  BroadcastChannel,
  BroadcastRecipientStatus,
  BroadcastStatus,
} from './values';

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
  content: () => EmailDocument,
  scheduledAt: isoDate,
  startedAt: isoDate,
  finishedAt: isoDate,
  occurrenceAt: isoDate,
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
    /**
     * SMS: the text. Email: the plain-text part, rendered from `content` when it is saved.
     * `{{ firstName | there }}` fills in each customer's value.
     */
    body: true,
    /**
     * Email only: the message as the email editor's document (maily JSON). Core renders it
     * to the HTML it sends; fields are `variable` nodes with a placeholder's name.
     */
    content: true,
    fromName: true,
    replyTo: true,
    /** Email only: files (`/files`) attached to every copy and test email. */
    attachmentIds: true,
    scheduledAt: true,
    startedAt: true,
    finishedAt: true,
    error: true,
    /** Recipients frozen when sending started. */
    total: true,
    /** The recurring broadcast this one is a run of. */
    parentId: true,
    /** The moment of the parent's schedule this run is for. */
    occurrenceAt: true,
    createdBy: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    stats: BroadcastStats,
    /** A recurring broadcast's next run while its schedule is active; null otherwise. */
    nextRunAt: isoDate().nullable(),
  });

export type Broadcast = z.infer<typeof Broadcast>;

const BroadcastFields = createUpdateSchema(broadcasts, {
  name: (name) => name.trim().min(1).max(120),
  viewId: () => Id.nullable(),
  filter: () => ConditionGroup.nullable(),
  subject: (subject) => subject.trim().max(200).nullable(),
  preheader: (preheader) => preheader.trim().max(200).nullable(),
  body: (body) => body.max(50_000),
  content: () => EmailDocument.nullable(),
  fromName: (name) =>
    name
      .trim()
      .max(80)
      .regex(/^[^<>"\r\n]*$/, 'no quotes, brackets or line breaks')
      .nullable(),
  replyTo: () => EmailAddress.nullable(),
  attachmentIds: () =>
    z
      .array(Id)
      .max(BROADCAST_ATTACHMENTS_MAX)
      .refine((ids) => new Set(ids).size === ids.length, 'each file once'),
}).pick({
  name: true,
  viewId: true,
  filter: true,
  subject: true,
  preheader: true,
  /** SMS only: the text. An email's text part is rendered from `content`. */
  body: true,
  /** Email only: the message as the email editor's document. */
  content: true,
  fromName: true,
  replyTo: true,
  /**
   * Email only: ready files of the organisation, at most `BROADCAST_ATTACHMENTS_MAX` and
   * `BROADCAST_ATTACHMENTS_MAX_MB` together.
   */
  attachmentIds: true,
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

const {
  BROADCAST_STATUS,
  BROADCAST_INCOMPLETE,
  BROADCAST_ATTACHMENT_UNAVAILABLE,
  BROADCAST_ATTACHMENTS_TOO_LARGE,
  UNKNOWN_PLACEHOLDER,
  NO_RECIPIENTS,
  INVALID_TYPE,
} = ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  BROADCAST_STATUS,
  BROADCAST_INCOMPLETE,
  BROADCAST_ATTACHMENT_UNAVAILABLE,
  BROADCAST_ATTACHMENTS_TOO_LARGE,
  UNKNOWN_PLACEHOLDER,
  NO_RECIPIENTS,
  INVALID_TYPE,
});

/** What sends an email broadcast: refused while the organisation can't deliver email. */
const sending = base.errors({ EMAIL_NOT_CONFIGURED: ERRORS.EMAIL_NOT_CONFIGURED });

const ById = z.object({ id: Id });

/** Email and SMS to many customers at once (decision 47). */
export const broadcastsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/broadcasts',
      summary:
        'Broadcasts, newest first. `from` and `to` keep those that started, or are scheduled, in that window; a draft with no date has neither',
    })
    .input(
      CursorQuery.extend({
        status: BroadcastStatus.optional(),
        channel: BroadcastChannel.optional(),
        search: z.string().trim().max(100).optional(),
        /** The runs of this recurring broadcast. */
        parentId: Id.optional(),
        /** Started, or scheduled when not started, at or after this moment. */
        from: z.iso.datetime({ offset: true }).optional(),
        /** …and before this one. */
        to: z.iso.datetime({ offset: true }).optional(),
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
        'Write a broadcast (a draft). 400 UNKNOWN_PLACEHOLDER for a `{{ … }}` erxes can’t fill, BROADCAST_ATTACHMENT_UNAVAILABLE for a file that isn’t ready, BROADCAST_ATTACHMENTS_TOO_LARGE past 10 MB of files',
    })
    .input(BroadcastCreate)
    .output(Broadcast),
  update: base
    .route({
      method: 'PATCH',
      path: '/broadcasts/{id}',
      summary:
        'Change a draft, scheduled or recurring broadcast (a recurring one’s later runs); 409 BROADCAST_STATUS once it has started',
    })
    .input(BroadcastUpdate)
    .output(Broadcast),
  remove: base
    .route({
      method: 'DELETE',
      path: '/broadcasts/{id}',
      summary:
        'Delete a broadcast that is not going out (draft, scheduled, sent, cancelled, failed, recurring: its runs stay)',
    })
    .input(ById)
    .output(z.object({ ok: z.literal(true) })),
  duplicate: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/duplicate',
      successStatus: 201,
      summary:
        'A new draft with the same audience and content; a recurring one’s copy keeps its schedule, not started',
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
  test: sending
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/test',
      successStatus: 202,
      summary:
        'Send the broadcast to up to 5 addresses (emails or phones, by channel) with sample values; not counted. 409 EMAIL_NOT_CONFIGURED when email can’t be delivered',
    })
    .input(ById.extend({ to: z.array(z.string().trim().min(3).max(254)).min(1).max(5) }))
    .output(z.object({ queued: z.int() })),
  send: sending
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/send',
      summary:
        'Start sending now: the audience is frozen and goes out at the deployment’s pace. 409 NO_RECIPIENTS when nobody is reachable, EMAIL_NOT_CONFIGURED when email can’t be delivered',
    })
    .input(ById)
    .output(Broadcast),
  schedule: sending
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/schedule',
      summary:
        'Send at `at` (in the future); the audience is frozen then. 409 EMAIL_NOT_CONFIGURED when email can’t be delivered',
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
  resume: sending
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/resume',
      summary: 'Back to sending. 409 EMAIL_NOT_CONFIGURED when email can’t be delivered',
    })
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
