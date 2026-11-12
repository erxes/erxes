import { EventNotify } from '@erxes/core-contract';
import { activities, companies, customers, type events } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import type { Caller } from '~/http/auth';
import { notify } from '~/modules/notifications/notifications.service';
import type { EventConsumer } from './processor';

type EventRow = typeof events.$inferSelect;

const callerOf = (event: EventRow): Caller => ({
  orgId: event.orgId,
  actorType: event.actorType === 'user' ? 'user' : 'plugin',
  actorId: event.actorId ?? event.source,
  source: event.source,
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
      .where(and(eq(table.orgId, event.orgId), eq(table.id, subjectId)))
      .limit(1);

    if (!subject) {
      return;
    }

    const [entry] = await tx
      .insert(activities)
      .values({
        id: event.id,
        orgId: event.orgId,
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

    if (entry && subject.ownerId && subject.ownerId !== event.actorId) {
      await notify(tx, callerOf(event), {
        userIds: [subject.ownerId],
        kind: event.type,
        title: summary,
        link:
          event.link ??
          `/contacts/${subjectType === 'customer' ? 'customers' : 'companies'}/${subjectId}`,
        entity: { type: event.entityType ?? subjectType, id: event.entityId ?? subjectId },
        data: { targetType: subjectType, targetId: subjectId },
        actorUserId: actorUserOf(event),
        dedupeKey: `event:${event.id}:owner`,
      });
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

    await notify(tx, callerOf(event), {
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
    });
  },
};
