import type { CursorQuery, Notification, NotificationInput } from '@erxes/core-contract';
import { Changes, UNMUTABLE_NOTIFICATION_KINDS } from '@erxes/core-contract';
import { type Db, newId, notifications, users } from '@erxes/core-db';
import { and, count, desc, eq, gt, inArray, isNotNull, isNull, like, lt, sql } from 'drizzle-orm';
import type { Actor, Caller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { keysetPage } from '~/lib/keyset';
import { assertMember, assertPluginNamespace } from '~/lib/guards';

type NotificationRow = typeof notifications.$inferSelect;

export const toNotificationDto = (row: NotificationRow): Notification => ({
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

type NotifyInput = Omit<NotificationInput, 'priority'> & {
  priority?: NotificationInput['priority'];
  /**
   * Core only: within this many minutes, a repeat from the same actor about
   * the same record updates the member's unread notification instead of
   * adding another (`data.changes` are combined, first "before" kept).
   */
  collapseMinutes?: number;
};

/** Has the member muted this kind, its source, or a prefix of it? */
export const isMuted = (muted: string[] | undefined, source: string, kind: string) =>
  !UNMUTABLE_NOTIFICATION_KINDS.includes(kind) &&
  (muted ?? []).some((entry) => entry === source || entry === kind || kind.startsWith(`${entry}.`));

const combineChanges = (earlier: Changes | undefined, later: Changes | undefined): Changes => {
  const combined: Changes = { ...earlier };

  for (const [field, [before, after]] of Object.entries(later ?? {})) {
    combined[field] = [field in combined ? combined[field]![0] : before, after];
  }

  // A field changed and changed back is no change.
  for (const [field, [before, after]] of Object.entries(combined)) {
    if (JSON.stringify(before) === JSON.stringify(after)) delete combined[field];
  }

  return combined;
};

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
    .select({ id: users.id, status: users.status, settings: users.notificationSettings })
    .from(users)
    .where(and(eq(users.orgId, caller.orgId), inArray(users.id, wanted)));

  if (members.length !== wanted.length) {
    throw new HttpError(
      400,
      'INVALID_RECIPIENT',
      'Some recipients are not team members of this organisation',
    );
  }

  const actorUserId =
    input.actorUserId ?? (caller.actorType === 'user' ? caller.actorId : undefined);

  const recipients = members
    .filter(
      (member) =>
        member.status === 'active' &&
        member.id !== actorUserId &&
        !isMuted(member.settings.muted, caller.source, input.kind),
    )
    .map((member) => member.id);

  if (!recipients.length) {
    return { created: 0, skipped: wanted.length };
  }

  const actorType = actorUserId ? ('user' as const) : caller.actorType;
  const actorId = actorUserId ?? caller.actorId;
  let pending = recipients;
  let collapsed = 0;

  if (input.collapseMinutes && input.entity) {
    const recent = await client
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.orgId, caller.orgId),
          inArray(notifications.userId, recipients),
          eq(notifications.kind, input.kind),
          eq(notifications.entityType, input.entity.type),
          eq(notifications.entityId, input.entity.id),
          eq(notifications.actorId, actorId),
          isNull(notifications.readAt),
          gt(notifications.createdAt, sql`now() - make_interval(mins => ${input.collapseMinutes})`),
        ),
      )
      .orderBy(desc(notifications.createdAt));

    const latest = new Map<string, NotificationRow>();

    recent.forEach((row) => latest.has(row.userId) || latest.set(row.userId, row));

    for (const row of latest.values()) {
      const changes = combineChanges(
        Changes.safeParse(row.data.changes).data,
        Changes.safeParse(input.data?.changes).data,
      );

      await client
        .update(notifications)
        .set({
          title: input.title,
          body: input.body ?? null,
          data: { ...row.data, ...input.data, changes },
          createdAt: sql`now()`,
        })
        .where(eq(notifications.id, row.id));
    }

    collapsed = latest.size;
    pending = recipients.filter((userId) => !latest.has(userId));
  }

  if (!pending.length) {
    return { created: 0, skipped: wanted.length - collapsed };
  }

  const inserted = await client
    .insert(notifications)
    .values(
      pending.map((userId) => ({
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
        data: input.data ?? {},
        priority: input.priority ?? 'normal',
        actorType,
        actorId,
        dedupeKey: input.dedupeKey ?? null,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: notifications.id });

  return { created: inserted.length, skipped: wanted.length - inserted.length - collapsed };
};

const mine = (actor: Actor) =>
  and(eq(notifications.orgId, actor.orgId), eq(notifications.userId, actor.userId))!;

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export const listNotifications = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & {
    unread?: boolean;
    source?: string;
    priority?: 'normal' | 'high';
    kind?: string;
  },
) => {
  const filters = and(
    query.unread === true ? isNull(notifications.readAt) : undefined,
    query.unread === false ? isNotNull(notifications.readAt) : undefined,
    query.source ? eq(notifications.source, query.source) : undefined,
    query.priority ? eq(notifications.priority, query.priority) : undefined,
    query.kind
      ? /[.*]$/.test(query.kind)
        ? like(notifications.kind, `${escapeLike(query.kind.replace(/\*$/, ''))}%`)
        : eq(notifications.kind, query.kind)
      : undefined,
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

/** Every inbox the member has (core and the plugins that notified them), with their settings. */
export const notificationSettings = async (client: Db, actor: Actor) => {
  const [user] = await client
    .select({ settings: users.notificationSettings })
    .from(users)
    .where(and(eq(users.orgId, actor.orgId), eq(users.id, actor.userId)))
    .limit(1);

  const sources = await client
    .selectDistinct({ source: notifications.source })
    .from(notifications)
    .where(mine(actor));

  const muted = user?.settings.muted ?? [];

  const plugins = new Set([
    ...sources.map((row) => row.source),
    // A muted plugin stays listed, so it can be unmuted.
    ...muted.filter((entry) => !entry.includes('.')),
  ]);

  plugins.delete('core');

  return { muted, sources: [...plugins].toSorted() };
};

export const updateNotificationSettings = async (
  client: Db,
  actor: Actor,
  input: { muted: string[] },
) => {
  await client
    .update(users)
    .set({
      notificationSettings: sql`jsonb_set(${users.notificationSettings}, '{muted}', ${JSON.stringify(unique(input.muted))}::jsonb)`,
    })
    .where(and(eq(users.orgId, actor.orgId), eq(users.id, actor.userId)));

  return notificationSettings(client, actor);
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

/** Deletes read notifications past the retention period (all organisations). */
export const pruneNotifications = async (client: Db, days: number) => {
  const result = await client
    .delete(notifications)
    .where(
      and(
        isNotNull(notifications.readAt),
        lt(notifications.readAt, sql`now() - make_interval(days => ${days})`),
      ),
    );

  return result.rowCount ?? 0;
};
