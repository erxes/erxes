import type { CursorQuery, Notification } from '@erxes/core-contract';
import { type Db, notifications } from '@erxes/core-db';
import { and, count, eq, inArray, isNotNull, isNull, like, sql } from 'drizzle-orm';
import type { Actor } from '~/http/auth';
import { notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { keysetPage } from '~/lib/keyset';
import { deleteInBatches } from '~/lib/sequence';

const toNotificationDto = (row: typeof notifications.$inferSelect): Notification => ({
  id: row.id,
  source: row.source,
  kind: row.kind,
  title: row.title,
  body: row.body,
  link: row.link,
  entity: row.entityType && row.entityId ? { type: row.entityType, id: row.entityId } : null,
  data: row.data,
  priority: row.priority,
  actor: { type: row.actorType, id: row.actorId },
  read: row.readAt !== null,
  createdAt: row.createdAt.toISOString(),
});

/** The member's own notifications. */
export const mine = (actor: Actor) => eq(notifications.userId, actor.userId);

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

/** A kind ending in `.` or `*` matches every kind under it. */
const kindFilter = (kind: string) =>
  /[.*]$/.test(kind)
    ? like(notifications.kind, `${escapeLike(kind.replace(/\*$/, ''))}%`)
    : eq(notifications.kind, kind);

export const listNotifications = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & {
    unread?: boolean;
    source?: string;
    priority?: Notification['priority'];
    kind?: string;
  },
) => {
  const filters = and(
    query.unread === true ? isNull(notifications.readAt) : undefined,
    query.unread === false ? isNotNull(notifications.readAt) : undefined,
    query.source ? eq(notifications.source, query.source) : undefined,
    query.priority ? eq(notifications.priority, query.priority) : undefined,
    query.kind ? kindFilter(query.kind) : undefined,
  );

  const page = await keysetPage(
    client,
    {
      table: notifications,
      id: notifications.id,
      createdAt: notifications.createdAt,
      scope: mine(actor),
    },
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

/**
 * Unread notifications, in total and per inbox (`core` and each plugin);
 * with `source`, only that plugin's inbox.
 */
export const unreadCount = async (client: Db, actor: Actor, source?: string) => {
  const rows = await client
    .select({ source: notifications.source, count: count() })
    .from(notifications)
    .where(
      and(
        mine(actor),
        isNull(notifications.readAt),
        source ? eq(notifications.source, source) : undefined,
      ),
    )
    .groupBy(notifications.source);

  const bySource = Object.fromEntries(rows.map((row) => [row.source, row.count]));

  return { count: rows.reduce((total, row) => total + row.count, 0), bySource };
};

/** Marks the given (or all) of the member's notifications read or unread. */
export const markRead = async (
  client: Db,
  actor: Actor,
  input: { ids?: string[]; source?: string; read: boolean },
) => {
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
        input.source ? eq(notifications.source, input.source) : undefined,
        input.read ? isNull(notifications.readAt) : isNotNull(notifications.readAt),
      ),
    );

  return { updated: result.rowCount ?? 0 };
};

export const removeNotification = async (client: Db, actor: Actor, id: string) => {
  const result = await client
    .delete(notifications)
    .where(and(mine(actor), eq(notifications.id, id)));

  if (!result.rowCount) {
    throw notFound('Notification');
  }

  return { ok: true as const };
};

const PRUNE_BATCH = 5000;

/** Deletes read notifications past the retention period (all organisations). */
export const pruneNotifications = (client: Db, days: number) =>
  deleteInBatches(200, PRUNE_BATCH, () =>
    client.execute(sql`
      delete from ${notifications} where id in (
        select id from ${notifications}
        where read_at is not null and read_at < now() - make_interval(days => ${days})
        limit ${PRUNE_BATCH}
      )
    `),
  );
