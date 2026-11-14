import { EVENT_FAILURE_STATUSES, NOTIFICATION_PRIORITIES } from '@erxes/core-db/enums';
import { events } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, Id, isoDate } from './common';
import { ActivityTarget } from './activities';
import { AppLink, DedupeKey, EntityType, EventType } from './platform';

/** What a published event asks core to notify (as `POST /notifications`). */
export const EventNotify = z.object({
  userIds: z.array(Id).min(1).max(500),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(2000).optional(),
  link: AppLink.optional(),
  priority: z.enum(NOTIFICATION_PRIORITIES).optional(),
});

export const EventInput = createUpdateSchema(events, {
  type: () => EventType,
  version: z.int().min(1).max(100).default(1),
  payload: z
    .record(z.string(), z.unknown())
    .refine((value) => JSON.stringify(value).length <= 32_000, 'at most 32 KB')
    .default({}),
  summary: z.string().trim().min(1).max(500).optional(),
  link: AppLink.optional(),
  notify: EventNotify.optional(),
  occurredAt: () => z.iso.datetime(),
  dedupeKey: DedupeKey.optional(),
  subjectType: ActivityTarget.optional(),
  subjectId: Id.optional(),
  entityType: EntityType.optional(),
  entityId: Id.optional(),
})
  .pick({
    /** Namespaced by the plugin: `hr.leave.approved`. */
    type: true,
    version: true,
    payload: true,
    summary: true,
    link: true,
    notify: true,
    occurredAt: true,
    /** Retry-safe: one event per plugin and key. */
    dedupeKey: true,
    /** The customer or company it concerns: with `summary`, it goes on their timeline. */
    subjectType: true,
    subjectId: true,
    /** The plugin's own record it is about. */
    entityType: true,
    entityId: true,
  })
  .required({ type: true })
  .extend({ actorUserId: Id.optional() })
  .refine(
    (value) => (value.subjectType === undefined) === (value.subjectId === undefined),
    'subjectType and subjectId go together',
  )
  .refine(
    (value) => (value.entityType === undefined) === (value.entityId === undefined),
    'entityType and entityId go together',
  );

export type EventInput = z.infer<typeof EventInput>;

export const CoreEvent = createSelectSchema(events, {
  id: Id,
  version: () => z.int(),
  payload: z.record(z.string(), z.unknown()),
  occurredAt: isoDate,
  createdAt: isoDate,
}).pick({
  id: true,
  source: true,
  type: true,
  version: true,
  /** The customer or company it concerns. */
  subjectType: true,
  subjectId: true,
  /** The plugin's own record it is about. */
  entityType: true,
  entityId: true,
  /** A team member (`actorId` = user id), a plugin (its name) or `system`. */
  actorType: true,
  actorId: true,
  payload: true,
  summary: true,
  link: true,
  occurredAt: true,
  createdAt: true,
});

export type CoreEvent = z.infer<typeof CoreEvent>;

export const EventFailureStatus = z.enum(EVENT_FAILURE_STATUSES);

/** An event a consumer (timeline, notifications, …) could not handle: its job in the consumer's queue. */
export const EventFailure = z.object({
  consumer: z.string(),
  status: EventFailureStatus,
  attempts: z.int(),
  lastError: z.string(),
  /** When the last attempt failed. */
  failedAt: isoDate(),
  /** When it is tried again; null once dead. */
  nextAttemptAt: isoDate().nullable(),
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
      summary:
        'Publish events (plugins only, up to 100). Types start with the plugin name; a dedupe key makes retries safe',
    })
    .input(z.object({ events: z.array(EventInput).min(1).max(100) }))
    .output(z.object({ published: z.int(), duplicates: z.int() })),
  list: oc
    .route({
      method: 'GET',
      path: '/events',
      summary: 'Recent events of the organisation (owners and admins)',
    })
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
      summary:
        'Events that could not be handled: retrying with backoff, or dead after the last attempt (owners and admins)',
    })
    .input(z.object({ status: EventFailureStatus.optional() }))
    .output(
      z.object({
        // The 200 most recently updated; `counts` covers all of them.
        data: z.array(EventFailure).max(200),
        counts: z.object({ retrying: z.int(), dead: z.int() }),
      }),
    ),
  retryFailures: oc
    .route({
      method: 'POST',
      path: '/events/failures/retry',
      summary: 'Try failed events again now (owners and admins)',
    })
    .input(
      z.object({
        failures: z.array(FailureRef).min(1).max(200).optional(),
        allDead: z.boolean().optional(),
      }),
    )
    .output(z.object({ retried: z.int() })),
  dismissFailures: oc
    .route({
      method: 'POST',
      path: '/events/failures/dismiss',
      summary: 'Give up on failed events (owners and admins)',
    })
    .input(z.object({ failures: z.array(FailureRef).min(1).max(200) }))
    .output(z.object({ dismissed: z.int() })),
};
