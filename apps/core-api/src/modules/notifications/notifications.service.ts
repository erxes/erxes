import type { CursorQuery, Notification, NotificationInput } from '@erxes/core-contract';
import { type Db, newId, notifications, users } from '@erxes/core-db';
import { and, count, eq, inArray, isNotNull, isNull, lt, sql } from 'drizzle-orm';
import type { Actor, Caller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { keysetPage } from '~/lib/keyset';
import { assertMember, assertPluginNamespace } from '~/modules/activities/activities.service';

type NotificationRow = typeof notifications.$inferSelect;

export const toNotificationDto = (row: NotificationRow): Notification => ({
  id: row.id,
  source: row.source,
  kind: row.kind,
  title: row.title,
  body: row.body,
  link: row.link,
  entity: row.entityType && row.entityId ? { type: row.entityType, id: row.entityId } : null,
  priority: row.priority,
  actor: { type: row.actorType, id: row.actorId },
  read: row.readAt !== null,
  createdAt: row.createdAt.toISOString(),
});

type NotifyInput = Omit<NotificationInput, 'priority'> & { priority?: NotificationInput['priority'] };

/**
 * Sends a notification to team members' inboxes, from core or a plugin
 * (`caller.source`). Unknown ids are an error; members who are not active,
 * and the member who caused it, are skipped. With a `dedupeKey`, a retry
 * creates nothing new.
 */
export const notify = async (client: Db, caller: Caller, input: NotifyInput) => {
  assertPluginNamespace(caller.source, input.kind);
  await assertMember(client, caller.orgId, input.actorUserId);

  const wanted = unique(input.userIds);
  const members = await client
    .select({ id: users.id, status: users.status })
    .from(users)
    .where(and(eq(users.orgId, caller.orgId), inArray(users.id, wanted)));

  if (members.length !== wanted.length) {
    throw new HttpError(400, 'INVALID_RECIPIENT', 'Some recipients are not team members of this organisation');
  }

  const actorUserId = input.actorUserId ?? (caller.actorType === 'user' ? caller.actorId : undefined);
  const recipients = members
    .filter((member) => member.status === 'active' && member.id !== actorUserId)
    .map((member) => member.id);

  if (!recipients.length) {
    return { created: 0, skipped: wanted.length };
  }

  const inserted = await client
    .insert(notifications)
    .values(
      recipients.map((userId) => ({
        id: newId(),
        orgId: caller.orgId,
        userId,
        source: caller.source,
        kind: input.kind,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
        entityType: input.entity?.type ?? null,
        entityId: input.entity?.id ?? null,
        priority: input.priority ?? 'normal',
        actorType: actorUserId ? ('user' as const) : caller.actorType,
        actorId: actorUserId ?? caller.actorId,
        dedupeKey: input.dedupeKey ?? null,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: notifications.id });

  return { created: inserted.length, skipped: wanted.length - inserted.length };
};

const mine = (actor: Actor) => and(eq(notifications.orgId, actor.orgId), eq(notifications.userId, actor.userId))!;

export const listNotifications = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & { unread?: boolean; source?: string },
) => {
  const filters = and(
    query.unread === true ? isNull(notifications.readAt) : undefined,
    query.unread === false ? isNotNull(notifications.readAt) : undefined,
    query.source ? eq(notifications.source, query.source) : undefined,
  );

  const page = await keysetPage(
    client,
    { table: notifications, id: notifications.id, createdAt: notifications.createdAt, scope: mine(actor) },
    filters,
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(notifications)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: page.data.map(toNotificationDto) };
};

export const unreadCount = async (client: Db, actor: Actor) => {
  const [row] = await client
    .select({ count: count() })
    .from(notifications)
    .where(and(mine(actor), isNull(notifications.readAt)));

  return { count: row?.count ?? 0 };
};

/** Marks the given (or all) of the member's notifications read or unread. */
export const markRead = async (client: Db, actor: Actor, input: { ids?: string[]; read: boolean }) => {
  if (input.ids && !input.ids.length) {
    return { updated: 0 };
  }

  const result = await client
    .update(notifications)
    .set({ readAt: input.read ? sql`now()` : null })
    .where(
      and(
        mine(actor),
        input.ids ? inArray(notifications.id, unique(input.ids)) : undefined,
        input.read ? isNull(notifications.readAt) : isNotNull(notifications.readAt),
      ),
    );

  return { updated: result.rowCount ?? 0 };
};

export const removeNotification = async (client: Db, actor: Actor, id: string) => {
  const result = await client.delete(notifications).where(and(mine(actor), eq(notifications.id, id)));

  if (!result.rowCount) {
    throw notFound('Notification');
  }

  return { ok: true as const };
};

/** Deletes read notifications past the retention period (all organisations). */
export const pruneNotifications = async (client: Db, days: number) => {
  const result = await client
    .delete(notifications)
    .where(and(isNotNull(notifications.readAt), lt(notifications.readAt, sql`now() - make_interval(days => ${days})`)));

  return result.rowCount ?? 0;
};
