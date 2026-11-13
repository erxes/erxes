import type { ActivityInput } from '@erxes/core-contract';
import { activities, companies, customers, type Db, newId } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { type PluginCaller, pluginCaller } from '~/http/auth';
import { notFound } from '~/http/errors';
import { guardDeletions } from '~/lib/deletionGuard';
import { assertMembers, assertPluginNamespace } from '~/lib/guards';
import { oneRow } from '~/lib/rows';
import { notify } from '~/modules/notifications/notifications.service';
import { type ActivityRow, reactionsOf, toActivityDto } from './activities.service';
import { assertTimelineAccess, isCoreTarget } from './timelineAccess';

/**
 * A plugin event on a record someone owns reaches the owner's inbox for that
 * plugin (muting the plugin mutes these too).
 */
const notifyTargetOwner = async (
  client: Db,
  caller: PluginCaller,
  input: ActivityInput,
  activity: ActivityRow,
) => {
  if (!isCoreTarget(input.targetType)) return;

  const table = input.targetType === 'customer' ? customers : companies;

  const [target] = await client
    .select({ ownerId: table.ownerId })
    .from(table)
    .where(and(eq(table.orgId, caller.orgId), eq(table.id, input.targetId)))
    .limit(1);

  if (!target?.ownerId || target.ownerId === input.actorUserId) {
    return;
  }

  await notify(client, pluginCaller(caller), {
    userIds: [target.ownerId],
    kind: input.type,
    title: input.summary,
    link:
      input.link ??
      `/contacts/${input.targetType === 'customer' ? 'customers' : 'companies'}/${input.targetId}`,
    entity: input.entity ?? { type: input.targetType, id: input.targetId },
    data: { targetType: input.targetType, targetId: input.targetId },
    actorUserId: input.actorUserId,
    dedupeKey: `activity:${activity.id}`,
  });
};

/**
 * A plugin adds an entry to a customer's or company's timeline. With a
 * `dedupeKey`, a retry returns the entry made the first time (`created: false`).
 */
export const createPluginActivity = async (
  client: Db,
  caller: PluginCaller,
  input: ActivityInput,
) => {
  assertPluginNamespace(caller.plugin, input.type);
  await assertTimelineAccess(
    client,
    { plugin: caller, orgId: caller.orgId },
    input.targetType,
    input.targetId,
  );
  await assertMembers(client, caller.orgId, [input.actorUserId]);

  const [inserted] = await client
    .insert(activities)
    .values({
      id: newId(),
      orgId: caller.orgId,
      targetType: input.targetType,
      targetId: input.targetId,
      source: caller.plugin,
      type: input.type,
      summary: input.summary,
      data: input.data ?? {},
      entityType: input.entity?.type ?? null,
      entityId: input.entity?.id ?? null,
      link: input.link ?? null,
      actorType: input.actorUserId ? 'user' : 'plugin',
      actorId: input.actorUserId ?? caller.plugin,
      dedupeKey: input.dedupeKey ?? null,
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : sql`now()`,
    })
    .onConflictDoNothing()
    .returning();

  if (inserted) {
    await notifyTargetOwner(client, caller, input, inserted);

    return { activity: toActivityDto(inserted), created: true };
  }

  const existing = oneRow(
    await client
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.orgId, caller.orgId),
          eq(activities.source, caller.plugin),
          eq(activities.dedupeKey, input.dedupeKey ?? ''),
        ),
      )
      .limit(1),
  );

  return { activity: toActivityDto(existing), created: false };
};

/** A plugin's own entry, by id or by `key:<dedupeKey>`. */
const pluginEntry = async (client: Db, caller: PluginCaller, ref: string) => {
  const [row] = await client
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.orgId, caller.orgId),
        eq(activities.source, caller.plugin),
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
  caller: PluginCaller,
  ref: string,
  input: { summary?: string; data?: Record<string, unknown>; link?: string | null },
) => {
  const row = await pluginEntry(client, caller, ref);
  const reactions = reactionsOf(row.data);

  const saved = oneRow(
    await client
      .update(activities)
      .set({
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.data !== undefined
          ? { data: { ...input.data, ...(reactions ? { reactions } : {}) } }
          : {}),
        ...(input.link !== undefined ? { link: input.link } : {}),
        editedAt: sql`now()`,
      })
      .where(eq(activities.id, row.id))
      .returning(),
  );

  return toActivityDto(saved);
};

export const removePluginActivity = async (client: Db, caller: PluginCaller, ref: string) => {
  const row = await pluginEntry(client, caller, ref);

  await guardDeletions(client, pluginCaller(caller), 1, 'timeline entries');

  await client.delete(activities).where(eq(activities.id, row.id));

  return { ok: true as const };
};
