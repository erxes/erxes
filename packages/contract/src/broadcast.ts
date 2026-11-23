import { broadcasts } from '@erxes/core-db/schema';
import { ConditionGroup } from '@erxes/core-db/automationDefinition';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { EmailAddress, Id, isoDate } from './common';
import { EmailDocument } from './emailDocument';
import { BROADCAST_ATTACHMENTS_MAX, BroadcastChannel } from './values';

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
    /**
     * Email only: an address on a domain the organisation's own provider verified
     * (`emails.sender` lists them); null: the address in Settings › Email sending.
     */
    fromEmail: true,
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
  fromEmail: () => EmailAddress.nullable(),
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
  /**
   * Email only: an address on a domain the organisation's own provider verified;
   * 400 INVALID_INPUT for any other. Null: the address in Settings › Email sending.
   */
  fromEmail: true,
  replyTo: true,
  /**
   * Email only: ready files of the organisation, at most `BROADCAST_ATTACHMENTS_MAX` and
   * `BROADCAST_ATTACHMENTS_MAX_MB` together.
   */
  attachmentIds: true,
});

export const oneAudience = (value: { viewId?: string | null; filter?: unknown }) =>
  !(value.viewId && value.filter);

export const BroadcastCreate = BroadcastFields.required({ name: true })
  .extend({ channel: BroadcastChannel })
  .refine(oneAudience, 'a view or a filter, not both');

export const BroadcastUpdate = BroadcastFields.extend({ id: Id }).refine(
  oneAudience,
  'a view or a filter, not both',
);
