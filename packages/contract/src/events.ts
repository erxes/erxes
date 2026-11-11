import { oc } from '@orpc/contract';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, Id } from './common';
import { ActivityTarget } from './activities';
import { ActorRef, AppLink, DedupeKey, EntityRef, EventType } from './platform';

/** What a published event asks core to notify (as `POST /notifications`). */
export const EventNotify = z.object({
  userIds: z.array(Id).min(1).max(500),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(2000).optional(),
  link: AppLink.optional(),
  priority: z.enum(['normal', 'high']).optional(),
});

export const EventInput = z.object({
  /** Namespaced by the plugin: `hr.leave.approved`. */
  type: EventType,
  version: z.number().int().min(1).max(100).default(1),
  payload: z
    .record(z.unknown())
    .refine((value) => JSON.stringify(value).length <= 32_000, 'at most 32 KB')
    .default({}),
  /** The customer or company it concerns: with `summary`, it goes on their timeline. */
  subject: z.object({ type: ActivityTarget, id: Id }).optional(),
  summary: z.string().trim().min(1).max(500).optional(),
  link: AppLink.optional(),
  entity: EntityRef.optional(),
  notify: EventNotify.optional(),
  actorUserId: Id.optional(),
  occurredAt: z.string().datetime().optional(),
  /** Retry-safe: one event per plugin and key. */
  dedupeKey: DedupeKey.optional(),
});
export type EventInput = z.infer<typeof EventInput>;

export const CoreEvent = z.object({
  id: Id,
  source: z.string(),
  type: z.string(),
  version: z.number().int(),
  subject: z.object({ type: ActivityTarget, id: Id }).nullable(),
  entity: EntityRef.nullable(),
  actor: ActorRef,
  payload: z.record(z.unknown()),
  summary: z.string().nullable(),
  link: z.string().nullable(),
  occurredAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});
export type CoreEvent = z.infer<typeof CoreEvent>;

export const EventFailureStatus = z.enum(['retrying', 'dead']);

/** An event a consumer (timeline, notifications, …) could not handle. */
export const EventFailure = z.object({
  consumer: z.string(),
  status: EventFailureStatus,
  attempts: z.number().int(),
  lastError: z.string(),
  nextAttemptAt: z.string().datetime().nullable(),
  firstFailedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  event: CoreEvent,
});
export type EventFailure = z.infer<typeof EventFailure>;

const FailureRef = z.object({ consumer: z.string().trim().min(1).max(100), eventId: Id });

/**
 * The event stream (transactional outbox). Plugins on core's database publish
 * with `SELECT core_publish_event(…)` inside their own transaction; others use
 * `POST /events`. Core turns events into timeline entries and notifications;
 * automations and webhooks will read the same stream.
 */
export const eventsContract = {
  publish: oc
    .route({
      method: 'POST',
      path: '/events',
      successStatus: 201,
      summary: 'Publish events (plugins only, up to 100). Types start with the plugin name; a dedupe key makes retries safe',
    })
    .input(z.object({ events: z.array(EventInput).min(1).max(100) }))
    .output(z.object({ published: z.number().int(), duplicates: z.number().int() })),
  list: oc
    .route({ method: 'GET', path: '/events', summary: 'Recent events of the organisation (owners and admins)' })
    .input(
      CursorQuery.extend({
        source: z.string().trim().max(40).optional(),
        /** A type, or a prefix ending in `.` or `*`. */
        type: z.string().trim().max(100).optional(),
        subjectType: ActivityTarget.optional(),
        subjectId: Id.optional(),
      }),
    )
    .output(cursorPageOf(CoreEvent)),
  failures: oc
    .route({
      method: 'GET',
      path: '/events/failures',
      summary: 'Events that could not be handled: retrying with backoff, or dead after the last attempt (owners and admins)',
    })
    .input(z.object({ status: EventFailureStatus.optional() }))
    .output(
      z.object({
        data: z.array(EventFailure),
        counts: z.object({ retrying: z.number().int(), dead: z.number().int() }),
      }),
    ),
  retryFailures: oc
    .route({ method: 'POST', path: '/events/failures/retry', summary: 'Try failed events again now (owners and admins)' })
    .input(z.object({ failures: z.array(FailureRef).min(1).max(200).optional(), allDead: z.boolean().optional() }))
    .output(z.object({ retried: z.number().int() })),
  dismissFailures: oc
    .route({ method: 'POST', path: '/events/failures/dismiss', summary: 'Give up on failed events (owners and admins)' })
    .input(z.object({ failures: z.array(FailureRef).min(1).max(200) }))
    .output(z.object({ dismissed: z.number().int() })),
};
