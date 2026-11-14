import type { NotificationInput } from '@erxes/core-contract';
import {
  actorOf,
  caller,
  type Db,
  newId,
  notifications,
  organizations,
  requestOrgId,
  sourceOf,
  users,
} from '@erxes/core-db';
import { and, desc, eq, gt, inArray, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { assertMembers, assertPluginNamespace } from '~/lib/guards';
import { lockKeys } from '~/lib/locks';
import { inOrder } from '~/lib/sequence';
import { appLink, sendEmail } from '~/modules/email/email';
import { deliveryFor } from './delivery';

type NotificationRow = typeof notifications.$inferSelect;

export type NotifyInput = Omit<NotificationInput, 'priority'> & {
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
 * For each input, the members to notify (one query for all of them): unknown
 * ids are an error; members who are not active, who turned this off, or who
 * caused it are skipped. `emails` are the addresses of those who also want it
 * by email. `actorType` and `actorId` are who the notification is from.
 */
const recipientsOf = async (client: Db, source: string, inputs: NotifyInput[]) => {
  const actor = actorOf(caller());

  const rows = await client
    .select({
      id: users.id,
      email: users.email,
      status: users.status,
      settings: users.notificationSettings,
    })
    .from(users)
    .where(inArray(users.id, unique(inputs.flatMap((input) => input.userIds))));

  const members = new Map(rows.map((member) => [member.id, member]));

  return inputs.map((input) => {
    const wanted = unique(input.userIds);
    const delivered = wanted.flatMap((id) => members.get(id) ?? []);

    if (delivered.length !== wanted.length) {
      throw fail('INVALID_RECIPIENT', 'Some recipients are not team members of this organisation');
    }

    const actorUserId =
      input.actorUserId ?? (actor.actorType === 'user' ? actor.actorId : undefined);

    const delivery = new Map(
      delivered.map((member) => [member.id, deliveryFor(member.settings, source, input.kind)]),
    );

    const recipients = delivered
      .filter(
        (member) =>
          member.status === 'active' &&
          member.id !== actorUserId &&
          delivery.get(member.id) !== 'off',
      )
      .map((member) => member.id);

    // Also by email: members who chose it for this group and haven't turned email off.
    const emails = new Map(
      delivered
        .filter((member) => member.settings.email !== false && delivery.get(member.id) === 'email')
        .map((member) => [member.id, member.email]),
    );

    return {
      input,
      wanted: wanted.length,
      recipients,
      emails,
      actorType: actorUserId ? ('user' as const) : actor.actorType,
      actorId: actorUserId ?? actor.actorId,
    };
  });
};

/**
 * Folds this notification into each recipient's unread one from the same
 * actor about the same record, if recent; returns who was updated.
 */
const collapseRecent = async (
  client: Db,
  orgId: string,
  input: NotifyInput & { entityType: string; entityId: string; collapseMinutes: number },
  recipients: string[],
  actorId: string | null,
) => {
  // One collapse at a time per entity and actor: changes combine, none is lost.
  await lockKeys(client, [
    `notify:${orgId}:${input.kind}:${input.entityType}:${input.entityId}:${actorId}`,
  ]);

  const recent = await client
    .select()
    .from(notifications)
    .where(
      and(
        inArray(notifications.userId, recipients),
        eq(notifications.kind, input.kind),
        eq(notifications.entityType, input.entityType),
        eq(notifications.entityId, input.entityId),
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
  orgId: string,
  emails: { to: string; input: NotifyInput }[],
) => {
  if (!emails.length) return;

  const [org] = await client.select({ name: organizations.name }).from(organizations).limit(1);

  const app = await appLink(client, '');

  await sendEmail(
    client,
    orgId,
    emails.map(({ to, input }) => ({
      to,
      template: 'notification' as const,
      data: {
        organization: org?.name ?? 'erxes',
        title: input.title,
        body: input.body ?? null,
        link: `${app}${input.link ?? '/notifications'}`,
      },
    })),
  );
};

/**
 * Sends notifications to team members' inboxes, from core or the calling
 * plugin, one input or many at once. Runs inside `withOrg`. Unknown ids are
 * an error; members who are not active, and the member who caused it, are
 * skipped. With a `dedupeKey`, a retry creates nothing new.
 */
export const notify = async (client: Db, input: NotifyInput | NotifyInput[]) => {
  const inputs = Array.isArray(input) ? input : [input];

  if (!inputs.length) return { created: 0, skipped: 0 };

  const orgId = requestOrgId();
  const source = sourceOf(caller());

  inputs.forEach((one) => assertPluginNamespace(source, one.kind));
  await assertMembers(
    client,
    inputs.map((one) => one.actorUserId),
  );

  const planned = await recipientsOf(client, source, inputs);
  const collapsed = new Map<(typeof planned)[number], Set<string>>();

  const rowsOf = (plan: (typeof planned)[number]) =>
    plan.recipients
      .filter((userId) => !collapsed.get(plan)?.has(userId))
      .map((userId) => ({
        input: plan.input,
        email: plan.emails.get(userId),
        row: {
          id: newId(),
          userId,
          source,
          kind: plan.input.kind,
          title: plan.input.title,
          body: plan.input.body ?? null,
          link: plan.input.link ?? null,
          entityType: plan.input.entityType ?? null,
          entityId: plan.input.entityId ?? null,
          data: plan.input.data ?? {},
          priority: plan.input.priority ?? 'normal',
          actorType: plan.actorType,
          actorId: plan.actorId,
          dedupeKey: plan.input.dedupeKey ?? null,
        },
      }));

  /** The rows that were new (a `dedupeKey` retry inserts nothing). */
  const insert = async (pending: ReturnType<typeof rowsOf>) => {
    if (!pending.length) return [];

    const inserted = new Set(
      (
        await client
          .insert(notifications)
          .values(pending.map(({ row }) => row))
          .onConflictDoNothing()
          .returning({ id: notifications.id })
      ).map((row) => row.id),
    );

    return pending.filter(({ row }) => inserted.has(row.id));
  };

  const collapsing = planned.flatMap((plan) => {
    const { entityType, entityId, collapseMinutes } = plan.input;

    return collapseMinutes && entityType && entityId && plan.recipients.length
      ? [{ plan, input: { ...plan.input, entityType, entityId, collapseMinutes } }]
      : [];
  });

  const created: ReturnType<typeof rowsOf> = [];

  // Collapsing locks and reads per entity, and folds into what the inputs
  // before it created, so each of those inputs collapses and inserts in turn.
  await inOrder(collapsing, async ({ plan, input: one }) => {
    collapsed.set(plan, await collapseRecent(client, orgId, one, plan.recipients, plan.actorId));
    created.push(...(await insert(rowsOf(plan))));
  });

  const plain = planned.filter((plan) => !collapsing.some((entry) => entry.plan === plan));

  created.push(...(await insert(plain.flatMap(rowsOf))));

  // New notifications only (a collapsed change was already announced).
  await emailNotified(
    client,
    orgId,
    created.flatMap(({ input: one, email }) => (email ? [{ to: email, input: one }] : [])),
  );

  // Skipped: wanted, but neither notified anew nor folded into an unread one.
  const uncollapsed = planned.reduce(
    (sum, plan) => sum + plan.wanted - (collapsed.get(plan)?.size ?? 0),
    0,
  );

  return { created: created.length, skipped: uncollapsed - created.length };
};
