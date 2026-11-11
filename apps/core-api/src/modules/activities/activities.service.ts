import type { Activity, ActivityInput, ActivityTarget, CursorQuery } from '@erxes/core-contract';
import { activities, companies, customers, type Db, newId } from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { type Actor, type Caller, type PluginCaller, pluginCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { assertMember, assertPluginNamespace } from '~/lib/guards';
import { keysetPage } from '~/lib/keyset';
import { notify } from '~/modules/notifications/notifications.service';

type ActivityRow = typeof activities.$inferSelect;

export const toActivityDto = (row: ActivityRow): Activity => ({
  id: row.id,
  targetType: row.targetType,
  targetId: row.targetId,
  source: row.source,
  type: row.type,
  summary: row.summary,
  data: row.data,
  entity: row.entityType && row.entityId ? { type: row.entityType, id: row.entityId } : null,
  link: row.link,
  actor: { type: row.actorType, id: row.actorId },
  occurredAt: row.occurredAt.toISOString(),
});

export interface CoreActivity {
  targetType: ActivityTarget;
  targetId: string;
  type: string;
  data?: Record<string, unknown>;
}

/**
 * Adds core's own entries to the timeline. Call it in the same transaction as
 * the change it describes.
 */
export const recordActivity = async (client: Db, caller: Caller, entries: CoreActivity | CoreActivity[]) => {
  const list = Array.isArray(entries) ? entries : [entries];

  if (!list.length) {
    return;
  }

  await client.insert(activities).values(
    list.map((entry) => ({
      id: newId(),
      orgId: caller.orgId,
      targetType: entry.targetType,
      targetId: entry.targetId,
      source: 'core',
      type: entry.type,
      data: entry.data ?? {},
      actorType: caller.actorType,
      actorId: caller.actorId,
    })),
  );
};

/** Merged records: their timelines move to the record that was kept. */
export const moveActivities = async (
  client: Db,
  orgId: string,
  targetType: ActivityTarget,
  fromIds: string[],
  toId: string,
) => {
  if (!fromIds.length) {
    return;
  }

  await client
    .update(activities)
    .set({ targetId: toId })
    .where(and(eq(activities.orgId, orgId), eq(activities.targetType, targetType), inArray(activities.targetId, fromIds)));
};

/** Deleted records: their timeline goes too (privacy: nothing is left behind). */
export const removeActivities = async (client: Db, orgId: string, targetType: ActivityTarget, ids: string[]) => {
  if (!ids.length) {
    return;
  }

  await client
    .delete(activities)
    .where(and(eq(activities.orgId, orgId), eq(activities.targetType, targetType), inArray(activities.targetId, ids)));
};

const assertTarget = async (client: Db, orgId: string, targetType: ActivityTarget, targetId: string) => {
  const table = targetType === 'customer' ? customers : companies;
  const [row] = await client
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.orgId, orgId), eq(table.id, targetId)))
    .limit(1);

  if (!row) {
    throw notFound(targetType === 'customer' ? 'Customer' : 'Company');
  }
};

export const listActivities = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & { targetType: ActivityTarget; targetId: string; source?: string },
) => {
  await assertTarget(client, actor.orgId, query.targetType, query.targetId);

  const page = await keysetPage(
    client,
    {
      table: activities,
      id: activities.id,
      // Timeline order is when it happened, which a plugin may backdate.
      createdAt: activities.occurredAt,
      scope: and(
        eq(activities.orgId, actor.orgId),
        eq(activities.targetType, query.targetType),
        eq(activities.targetId, query.targetId),
      )!,
    },
    query.source ? eq(activities.source, query.source) : undefined,
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(activities)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: page.data.map(toActivityDto) };
};

/**
 * A plugin event on a record someone owns reaches the owner's inbox for that
 * plugin (muting the plugin mutes these too).
 */
const notifyTargetOwner = async (client: Db, caller: PluginCaller, input: ActivityInput, activity: ActivityRow) => {
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
    link: input.link ?? `/contacts/${input.targetType === 'customer' ? 'customers' : 'companies'}/${input.targetId}`,
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
export const createPluginActivity = async (client: Db, caller: PluginCaller, input: ActivityInput) => {
  assertPluginNamespace(caller.plugin, input.type);
  await assertTarget(client, caller.orgId, input.targetType, input.targetId);
  await assertMember(client, caller.orgId, input.actorUserId);

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

  const [existing] = await client
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.orgId, caller.orgId),
        eq(activities.source, caller.plugin),
        eq(activities.dedupeKey, input.dedupeKey ?? ''),
      ),
    )
    .limit(1);

  return { activity: toActivityDto(existing!), created: false };
};
