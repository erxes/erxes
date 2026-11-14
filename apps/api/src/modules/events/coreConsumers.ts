import { EventNotify } from '@erxes/core-contract';
import { activities, type Caller, companies, customers, type events, runAs } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
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
 * Plugin events about a customer or company with a `summary` go on its
 * timeline; the record's owner hears about it in that plugin's inbox.
 */
export const timelineConsumer: EventConsumer = {
  name: 'core.timeline',
  async handle(tx, event) {
    const { subjectType, subjectId, summary } = event;

    if (event.source === 'core' || !subjectType || !subjectId || !summary) {
      return;
    }

    const table = subjectType === 'customer' ? customers : companies;

    const [subject] = await tx
      .select({ ownerId: table.ownerId })
      .from(table)
      .where(eq(table.id, subjectId))
      .limit(1);

    if (!subject) {
      return;
    }

    const { ownerId } = subject;

    const [entry] = await tx
      .insert(activities)
      .values({
        id: event.id,
        targetType: subjectType,
        targetId: subjectId,
        source: event.source,
        type: event.type,
        summary,
        data: event.payload,
        entityType: event.entityType,
        entityId: event.entityId,
        link: event.link,
        actorType: event.actorType,
        actorId: event.actorId,
        dedupeKey: `event:${event.id}`,
        occurredAt: event.occurredAt,
      })
      .onConflictDoNothing()
      .returning({ id: activities.id });

    if (entry && ownerId && ownerId !== event.actorId) {
      await runAs(publisherOf(event), () =>
        notify(tx, {
          userIds: [ownerId],
          kind: event.type,
          title: summary,
          link:
            event.link ??
            `/contacts/${subjectType === 'customer' ? 'customers' : 'companies'}/${subjectId}`,
          entity: { type: event.entityType ?? subjectType, id: event.entityId ?? subjectId },
          data: { targetType: subjectType, targetId: subjectId },
          actorUserId: actorUserOf(event),
          dedupeKey: `event:${event.id}:owner`,
        }),
      );
    }
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
        entity:
          event.entityType && event.entityId
            ? { type: event.entityType, id: event.entityId }
            : undefined,
        actorUserId: actorUserOf(event),
        dedupeKey: `event:${event.id}`,
      }),
    );
  },
};
