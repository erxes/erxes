import type { ActivityInput, coreContract } from '@erxes/core-contract';
import type { InferContractRouterInputs } from '@orpc/contract';
import { activities, caller, companies, customers, type Db, newId, notes } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import type { PgInsertValue } from 'drizzle-orm/pg-core';
import { notFound } from '~/http/errors';
import { guardDeletions } from '~/lib/deletionGuard';
import { assertMembers, assertPluginNamespace } from '~/lib/guards';
import { oneRow } from '~/lib/rows';
import { notify } from '~/modules/notifications/notifications.service';
import { entryById } from './activities.service';
import { assertTimelineAccess, isCoreTarget } from './timelineAccess';

/**
 * A plugin event on a record someone owns reaches the owner's inbox for that
 * plugin (muting the plugin mutes these too).
 */
const notifyTargetOwner = async (client: Db, input: ActivityInput, activityId: string) => {
  if (!isCoreTarget(input.targetType)) return;

  const table = input.targetType === 'customer' ? customers : companies;

  const [target] = await client
    .select({ ownerId: table.ownerId })
    .from(table)
    .where(eq(table.id, input.targetId))
    .limit(1);

  if (!target?.ownerId || target.ownerId === input.actorUserId) {
    return;
  }

  await notify(client, {
    userIds: [target.ownerId],
    kind: input.type,
    title: input.summary,
    link:
      input.link ??
      `/contacts/${input.targetType === 'customer' ? 'customers' : 'companies'}/${input.targetId}`,
    entityType: input.entityType ?? input.targetType,
    entityId: input.entityId ?? input.targetId,
    data: { targetType: input.targetType, targetId: input.targetId },
    actorUserId: input.actorUserId,
    dedupeKey: `activity:${activityId}`,
  });
};

/** A plugin's entry, once per dedupe key: its id, and whether this call made it. */
const insertOnce = async (
  client: Db,
  entry: PgInsertValue<typeof activities> & { source: string; dedupeKey: string | null },
) => {
  const [inserted] = await client
    .insert(activities)
    .values(entry)
    .onConflictDoNothing()
    .returning({ id: activities.id });

  if (inserted) return { id: inserted.id, created: true };

  const existing = oneRow(
    await client
      .select({ id: activities.id })
      .from(activities)
      .where(
        and(eq(activities.source, entry.source), eq(activities.dedupeKey, entry.dedupeKey ?? '')),
      )
      .limit(1),
  );

  return { id: existing.id, created: false };
};

/**
 * A plugin adds an entry to a customer's or company's timeline. With a
 * `dedupeKey`, a retry returns the entry made the first time (`created: false`).
 */
export const createPluginActivity = async (client: Db, input: ActivityInput) => {
  const { plugin } = caller('plugin');

  assertPluginNamespace(plugin, input.type);
  await assertTimelineAccess(client, input.targetType, input.targetId);
  await assertMembers(client, [input.actorUserId]);

  const entry = await insertOnce(client, {
    id: newId(),
    targetType: input.targetType,
    targetId: input.targetId,
    source: plugin,
    type: input.type,
    summary: input.summary,
    data: input.data ?? {},
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    link: input.link ?? null,
    actorType: input.actorUserId ? 'user' : 'plugin',
    actorId: input.actorUserId ?? plugin,
    dedupeKey: input.dedupeKey ?? null,
    occurredAt: input.occurredAt ? new Date(input.occurredAt) : sql`now()`,
  });

  if (entry.created) await notifyTargetOwner(client, input, entry.id);

  return { activity: await entryById(client, entry.id), created: entry.created };
};

/**
 * A note from old erxes on a timeline the plugin may write to, as its author wrote it then:
 * a member's note like `addNote` makes, without notifying anyone. A retried `dedupeKey`
 * returns the note made the first time.
 */
export const importPluginNote = async (
  client: Db,
  input: InferContractRouterInputs<typeof coreContract>['activities']['importNote'],
) => {
  const { plugin } = caller('plugin');

  await assertTimelineAccess(client, input.targetType, input.targetId);
  await assertMembers(client, [input.authorId]);

  const entry = await insertOnce(client, {
    id: newId(),
    targetType: input.targetType,
    targetId: input.targetId,
    source: plugin,
    type: `${input.targetType}.note`,
    actorType: 'user',
    actorId: input.authorId,
    dedupeKey: input.dedupeKey,
    occurredAt: new Date(input.createdAt),
  });

  if (entry.created) await client.insert(notes).values({ id: entry.id, body: input.body });

  return { activity: await entryById(client, entry.id), created: entry.created };
};

/** A plugin's own entry, by id or by `key:<dedupeKey>`. */
const pluginEntry = async (client: Db, ref: string) => {
  const [row] = await client
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.source, caller('plugin').plugin),
        ref.startsWith('key:') ? eq(activities.dedupeKey, ref.slice(4)) : eq(activities.id, ref),
      ),
    )
    .limit(1);

  if (!row) throw notFound('Entry');

  return row;
};

/** The order was refunded, the line changes: a plugin updates its own entry. */
export const updatePluginActivity = async (
  client: Db,
  ref: string,
  changes: { summary?: string; data?: Record<string, unknown>; link?: string | null },
) => {
  const row = await pluginEntry(client, ref);

  await client.update(activities).set(changes).where(eq(activities.id, row.id));

  return entryById(client, row.id);
};

export const removePluginActivity = async (client: Db, ref: string) => {
  const row = await pluginEntry(client, ref);

  await guardDeletions(client, 1, 'timeline entries');

  await client.delete(activities).where(eq(activities.id, row.id));

  return { ok: true as const };
};
