import type { ActivityInput } from '@erxes/core-contract';
import { activities, caller, companies, customers, type Db, newId } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
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

/**
 * A plugin adds an entry to a customer's or company's timeline. With a
 * `dedupeKey`, a retry returns the entry made the first time (`created: false`).
 */
export const createPluginActivity = async (client: Db, input: ActivityInput) => {
  const { plugin } = caller('plugin');

  assertPluginNamespace(plugin, input.type);
  await assertTimelineAccess(client, input.targetType, input.targetId);
  await assertMembers(client, [input.actorUserId]);

  const [inserted] = await client
    .insert(activities)
    .values({
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
    })
    .onConflictDoNothing()
    .returning({ id: activities.id });

  if (inserted) {
    await notifyTargetOwner(client, input, inserted.id);

    return { activity: await entryById(client, inserted.id), created: true };
  }

  const existing = oneRow(
    await client
      .select({ id: activities.id })
      .from(activities)
      .where(and(eq(activities.source, plugin), eq(activities.dedupeKey, input.dedupeKey ?? '')))
      .limit(1),
  );

  return { activity: await entryById(client, existing.id), created: false };
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
