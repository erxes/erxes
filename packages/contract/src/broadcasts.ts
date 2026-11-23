import { ConditionGroup } from '@erxes/core-db/automationDefinition';
import { oc } from '@orpc/contract';
import { z } from 'zod';
import { Broadcast, BroadcastCreate, BroadcastUpdate, oneAudience } from './broadcast';
import { BroadcastAudience, BroadcastRecipient, BroadcastRendered } from './broadcastRecipients';
import { cursorPageOf, CursorQuery, Id } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { BroadcastChannel, BroadcastRecipientStatus, BroadcastStatus } from './values';

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
const sending = base.errors({
  EMAIL_NOT_CONFIGURED: ERRORS.EMAIL_NOT_CONFIGURED,
  SMS_NOT_CONFIGURED: ERRORS.SMS_NOT_CONFIGURED,
});

const ById = z.object({ id: Id });

/** Email and SMS to many customers at once (decision 47). */
export const broadcastsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/broadcasts',
      summary: 'List broadcasts',
      description:
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
  get: base
    .route({ method: 'GET', path: '/broadcasts/{id}', summary: 'Get a broadcast' })
    .input(ById)
    .output(Broadcast),
  create: base
    .route({
      method: 'POST',
      path: '/broadcasts',
      successStatus: 201,
      summary: 'Create a broadcast',
      description:
        'Write a broadcast (a draft). 400 UNKNOWN_PLACEHOLDER for a `{{ … }}` erxes can’t fill, BROADCAST_ATTACHMENT_UNAVAILABLE for a file that isn’t ready, BROADCAST_ATTACHMENTS_TOO_LARGE past 10 MB of files',
    })
    .input(BroadcastCreate)
    .output(Broadcast),
  update: base
    .route({
      method: 'PATCH',
      path: '/broadcasts/{id}',
      summary: 'Change a broadcast',
      description:
        'Change a draft, scheduled or recurring broadcast (a recurring one’s later runs); 409 BROADCAST_STATUS once it has started',
    })
    .input(BroadcastUpdate)
    .output(Broadcast),
  remove: base
    .route({
      method: 'DELETE',
      path: '/broadcasts/{id}',
      summary: 'Delete a broadcast',
      description:
        'Delete a broadcast that is not going out (draft, scheduled, sent, cancelled, failed, recurring: its runs stay)',
    })
    .input(ById)
    .output(z.object({ ok: z.literal(true) })),
  duplicate: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/duplicate',
      successStatus: 201,
      summary: 'Duplicate a broadcast',
      description:
        'A new draft with the same audience and content; a recurring one’s copy keeps its schedule, not started',
    })
    .input(ById)
    .output(Broadcast),
  audience: base
    .route({
      method: 'POST',
      path: '/broadcasts/audience',
      summary: 'Count a broadcast audience',
      description: 'Who an audience (a view, a filter, or everyone) would reach on a channel now',
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
      summary: 'Preview a broadcast',
      description:
        "The broadcast as one customer would get it (`customerId`, else the audience's first customer, else sample values)",
    })
    .input(ById.extend({ customerId: Id.optional() }))
    .output(BroadcastRendered),
  test: sending
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/test',
      successStatus: 202,
      summary: 'Send a test broadcast',
      description:
        'Send the broadcast to up to 5 addresses (emails or phones, by channel) with sample values; not counted. 409 EMAIL_NOT_CONFIGURED or SMS_NOT_CONFIGURED when the channel can’t deliver',
    })
    .input(ById.extend({ to: z.array(z.string().trim().min(3).max(254)).min(1).max(5) }))
    .output(z.object({ queued: z.int() })),
  send: sending
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/send',
      summary: 'Send a broadcast now',
      description:
        'Start sending now: the audience is frozen and goes out at the deployment’s pace. 409 NO_RECIPIENTS when nobody is reachable, EMAIL_NOT_CONFIGURED or SMS_NOT_CONFIGURED when the channel can’t deliver',
    })
    .input(ById)
    .output(Broadcast),
  schedule: sending
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/schedule',
      summary: 'Schedule a broadcast',
      description:
        'Send at `at` (in the future); the audience is frozen then. 409 EMAIL_NOT_CONFIGURED or SMS_NOT_CONFIGURED when the channel can’t deliver',
    })
    .input(ById.extend({ at: z.iso.datetime({ offset: true }) }))
    .output(Broadcast),
  unschedule: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/unschedule',
      summary: 'Unschedule a broadcast',
      description: 'Back to a draft',
    })
    .input(ById)
    .output(Broadcast),
  pause: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/pause',
      summary: 'Pause a broadcast',
      description: 'Stop sending after the copies already being sent',
    })
    .input(ById)
    .output(Broadcast),
  resume: sending
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/resume',
      summary: 'Resume a broadcast',
      description:
        'Back to sending. 409 EMAIL_NOT_CONFIGURED or SMS_NOT_CONFIGURED when the channel can’t deliver',
    })
    .input(ById)
    .output(Broadcast),
  cancel: base
    .route({
      method: 'POST',
      path: '/broadcasts/{id}/cancel',
      summary: 'Cancel a broadcast',
      description: 'Stop for good; recipients not yet sent to are skipped',
    })
    .input(ById)
    .output(Broadcast),
  recipients: base
    .route({
      method: 'GET',
      path: '/broadcasts/{id}/recipients',
      summary: 'List broadcast recipients',
      description: "A broadcast's recipients and what became of each",
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
