import type { NotificationInput } from '@erxes/core-contract';
import { type Db, newId, notifications, organizations, users } from '@erxes/core-db';
import { and, desc, eq, gt, inArray, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { Caller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { assertMembers, assertPluginNamespace } from '~/lib/guards';
import { lockKeys } from '~/lib/locks';
import { appLink, sendEmail } from '~/modules/email/email';
import { deliveryFor } from './delivery';

type NotificationRow = typeof notifications.$inferSelect;

type NotifyInput = Omit<NotificationInput, 'priority'> & {
  priority?: NotificationInput['priority'];
  /**
   * Core only: within this many minutes, a repeat from the same actor about
   * the same record updates the member's unread notification instead of
   * adding another (`data.changes` are combined, first "before" kept).
   */
  collapseMinutes?: number;
};

/** `{ field: [before, after] }`, as core's `*.updated` notifications carry. */
const Changes = z.record(z.string(), z.tuple([z.unknown(), z.unknown()])).optional();

type Changes = z.infer<typeof Changes>;

const combineChanges = (first: Changes, then: Changes) => {
  const combined = { ...first };

  for (const [field, [before, after]] of Object.entries(then ?? {})) {
    const earlier = combined[field];

    combined[field] = [earlier ? earlier[0] : before, after];
  }

  // A field changed and changed back is no change.
  return Object.fromEntries(
    Object.entries(combined).filter(
      ([, [before, after]]) => JSON.stringify(before) !== JSON.stringify(after),
    ),
  );
};

/**
 * The members to notify: unknown ids are an error; members who are not
 * active, who turned this off, or who caused it are skipped. `emails` are
 * the addresses of those who also want it by email.
 */
const recipientsOf = async (
  client: Db,
  caller: Caller,
  input: NotifyInput,
  actorUserId: string | undefined,
) => {
  const wanted = unique(input.userIds);

  const members = await client
    .select({
      id: users.id,
      email: users.email,
      status: users.status,
      settings: users.notificationSettings,
    })
    .from(users)
    .where(and(eq(users.orgId, caller.orgId), inArray(users.id, wanted)));

  if (members.length !== wanted.length) {
    throw new HttpError(
      400,
      'INVALID_RECIPIENT',
      'Some recipients are not team members of this organisation',
    );
  }

  const delivered = members.map((member) => ({
    ...member,
    delivery: deliveryFor(member.settings, caller.source, input.kind),
  }));

  const recipients = delivered
    .filter(
      (member) =>
        member.status === 'active' && member.id !== actorUserId && member.delivery !== 'off',
    )
    .map((member) => member.id);

  // Also by email: members who chose it for this group and haven't turned email off.
  const emails = new Map(
    delivered
      .filter((member) => member.settings.email !== false && member.delivery === 'email')
      .map((member) => [member.id, member.email]),
  );

  return { wanted: wanted.length, recipients, emails };
};

/**
 * Folds this notification into each recipient's unread one from the same
 * actor about the same record, if recent; returns who was updated.
 */
const collapseRecent = async (
  client: Db,
  caller: Caller,
  input: NotifyInput & { entity: { type: string; id: string }; collapseMinutes: number },
  recipients: string[],
  actorId: string | null,
) => {
  // One collapse at a time per entity and actor: changes combine, none is lost.
  await lockKeys(client, [
    `notify:${caller.orgId}:${input.kind}:${input.entity.type}:${input.entity.id}:${actorId}`,
  ]);

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
        actorId === null ? isNull(notifications.actorId) : eq(notifications.actorId, actorId),
        isNull(notifications.readAt),
        gt(notifications.createdAt, sql`now() - make_interval(mins => ${input.collapseMinutes})`),
      ),
    )
    .orderBy(desc(notifications.createdAt));

  const latest = new Map<string, NotificationRow>();

  recent.forEach((row) => latest.has(row.userId) || latest.set(row.userId, row));

  const rows = [...latest.values()];

  if (rows.length) {
    // Each row's own data, combined with this one's, in one update.
    const data = rows.map((row) => {
      const changes = combineChanges(
        Changes.parse(row.data.changes),
        Changes.parse(input.data?.changes),
      );

      return sql`when ${notifications.id} = ${row.id} then ${JSON.stringify({ ...row.data, ...input.data, changes })}::jsonb`;
    });

    await client
      .update(notifications)
      .set({
        title: input.title,
        body: input.body ?? null,
        data: sql`case ${sql.join(data, sql` `)} end`,
        createdAt: sql`now()`,
      })
      .where(
        inArray(
          notifications.id,
          rows.map((row) => row.id),
        ),
      );
  }

  return new Set(latest.keys());
};

/** Emails the new notifications to the members who want them by email. */
const emailNotified = async (
  client: Db,
  caller: Caller,
  input: NotifyInput,
  addresses: string[],
) => {
  if (!addresses.length) return;

  const [org] = await client
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, caller.orgId))
    .limit(1);

  const link = await appLink(client, caller.orgId, input.link ?? '/notifications');

  await sendEmail(
    client,
    caller.orgId,
    addresses.map((to) => ({
      to,
      template: 'notification' as const,
      data: {
        organization: org?.name ?? 'erxes',
        title: input.title,
        body: input.body ?? null,
        link,
      },
    })),
  );
};

/**
 * Sends a notification to team members' inboxes, from core or a plugin
 * (`caller.source`). Unknown ids are an error; members who are not active,
 * and the member who caused it, are skipped. With a `dedupeKey`, a retry
 * creates nothing new.
 */
export const notify = async (client: Db, caller: Caller, input: NotifyInput) => {
  assertPluginNamespace(caller.source, input.kind);
  await assertMembers(client, caller.orgId, [input.actorUserId]);

  const actorUserId =
    input.actorUserId ?? (caller.actorType === 'user' ? caller.actorId : undefined);

  const { wanted, recipients, emails } = await recipientsOf(client, caller, input, actorUserId);

  if (!recipients.length) {
    return { created: 0, skipped: wanted };
  }

  const actorType = actorUserId ? ('user' as const) : caller.actorType;
  const actorId = actorUserId ?? caller.actorId;
  const { entity, collapseMinutes } = input;

  const collapsed =
    collapseMinutes && entity
      ? await collapseRecent(
          client,
          caller,
          { ...input, entity, collapseMinutes },
          recipients,
          actorId,
        )
      : new Set<string>();

  const pending = recipients.filter((userId) => !collapsed.has(userId));

  if (!pending.length) {
    return { created: 0, skipped: wanted - collapsed.size };
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
        entityType: entity?.type ?? null,
        entityId: entity?.id ?? null,
        data: input.data ?? {},
        priority: input.priority ?? 'normal',
        actorType,
        actorId,
        dedupeKey: input.dedupeKey ?? null,
      })),
    )
    .onConflictDoNothing()
    .returning({ userId: notifications.userId });

  // New notifications only (a collapsed change was already announced).
  await emailNotified(
    client,
    caller,
    input,
    inserted.flatMap((row) => emails.get(row.userId) ?? []),
  );

  return { created: inserted.length, skipped: wanted - inserted.length - collapsed.size };
};
