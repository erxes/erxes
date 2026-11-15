import { EventNotify } from '@erxes/core-contract';
import {
  activities,
  type Caller,
  companies,
  customers,
  type Db,
  type events,
  newId,
  runAs,
} from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { pluginTimeline } from '~/modules/activities/timelineAccess';
import { notify } from '~/modules/notifications/notifications.service';
import type { EventConsumer } from './consumers';

type EventRow = typeof events.$inferSelect;

/** The plugin that published the event (both consumers skip core's own). */
const publisherOf = (event: EventRow): Caller => ({
  type: 'plugin',
  plugin: event.source,
  scopes: [],
});

const actorUserOf = (event: EventRow) =>
  event.actorType === 'user' ? (event.actorId ?? undefined) : undefined;

/**
 * The event's timeline entry on one target. Keyed by the event (and the
 * target kind), so a retried job adds nothing; returns whether it was added.
 */
const addEntry = async (
  tx: Db,
  event: EventRow,
  target: { targetType: string; targetId: string; id: string; dedupeKey: string },
) => {
  const [entry] = await tx
    .insert(activities)
    .values({
      ...target,
      source: event.source,
      type: event.type,
      summary: event.summary,
      data: event.payload,
      entityType: event.entityType,
      entityId: event.entityId,
      link: event.link,
      actorType: event.actorType,
      actorId: event.actorId,
      occurredAt: event.occurredAt,
    })
    .onConflictDoNothing()
    .returning({ id: activities.id });

  return Boolean(entry);
};

/**
 * The plugin's own record (`entityType`, `entityId`) gets the entry when the
 * plugin's manifest declares that type in `timelines`; a type of another
 * plugin's or core's is ignored.
 */
const addRecordEntry = async (tx: Db, event: EventRow) => {
  const { entityType, entityId } = event;

  if (!entityType || !entityId || !entityType.startsWith(`${event.source}.`)) return;

  if (!(await pluginTimeline(tx, entityType))) return;

  await addEntry(tx, event, {
    id: newId(),
    targetType: entityType,
    targetId: entityId,
    dedupeKey: `event:${event.id}:record`,
  });
};

/**
 * The customer or company (`subjectType`, `subjectId`) gets the entry; its
 * owner hears about it in that plugin's inbox.
 */
const addSubjectEntry = async (tx: Db, event: EventRow) => {
  const { subjectType, subjectId, summary } = event;

  if (!subjectType || !subjectId || !summary) return;

  const table = subjectType === 'customer' ? customers : companies;

  const [subject] = await tx
    .select({ ownerId: table.ownerId })
    .from(table)
    .where(eq(table.id, subjectId))
    .limit(1);

  if (!subject) return;

  const { ownerId } = subject;

  const added = await addEntry(tx, event, {
    id: event.id,
    targetType: subjectType,
    targetId: subjectId,
    dedupeKey: `event:${event.id}`,
  });

  if (added && ownerId && ownerId !== event.actorId) {
    await runAs(publisherOf(event), () =>
      notify(tx, {
        userIds: [ownerId],
        kind: event.type,
        title: summary,
        link:
          event.link ??
          `/contacts/${subjectType === 'customer' ? 'customers' : 'companies'}/${subjectId}`,
        entityType: event.entityType ?? subjectType,
        entityId: event.entityId ?? subjectId,
        data: { targetType: subjectType, targetId: subjectId },
        actorUserId: actorUserOf(event),
        dedupeKey: `event:${event.id}:owner`,
      }),
    );
  }
};

/**
 * A plugin event with a `summary` goes on the timelines it names: the
 * plugin's own record and the customer or company (one event can reach both).
 */
export const timelineConsumer: EventConsumer = {
  name: 'core.timeline',
  async handle(tx, event) {
    if (event.source === 'core' || !event.summary) return;

    await addRecordEntry(tx, event);
    await addSubjectEntry(tx, event);
  },
};

/** Events with `notify` reach those members' inboxes. */
export const notificationsConsumer: EventConsumer = {
  name: 'core.notifications',
  async handle(tx, event) {
    if (event.source === 'core' || !event.notify) {
      return;
    }

    const request = EventNotify.parse(event.notify);

    await runAs(publisherOf(event), () =>
      notify(tx, {
        userIds: request.userIds,
        kind: event.type,
        title: request.title,
        body: request.body,
        link: request.link ?? event.link ?? undefined,
        priority: request.priority,
        entityType: event.entityType ?? undefined,
        entityId: event.entityId ?? undefined,
        actorUserId: actorUserOf(event),
        dedupeKey: `event:${event.id}`,
      }),
    );
  },
};
