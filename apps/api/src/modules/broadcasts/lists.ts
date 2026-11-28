import type { coreContract, CursorQuery } from '@erxes/core-contract';
import type { InferContractRouterInputs } from '@orpc/contract';
import {
  type BroadcastChannel,
  type BroadcastRecipientStatus,
  broadcastRecipients,
  callerUserId,
  customers,
  type Db,
  newId,
  type SuppressionReason,
  suppressions,
} from '@erxes/core-db';
import { and, eq, getTableColumns, ilike, inArray, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { containsPattern, keysetPage } from '~/lib/keyset';
import { publishCoreEvents } from '~/modules/events/events.service';
import { getBroadcast } from './broadcasts.service';

/** A recipient's customer, by name, else nothing (the address shows). */
const customerName = sql<
  string | null
>`nullif(trim(concat_ws(' ', ${customers.firstName}, ${customers.lastName})), '')`;

/** A broadcast's recipients and what became of each. */
export const listRecipients = async (
  client: Db,
  query: CursorQuery & { id: string; status?: BroadcastRecipientStatus; search?: string },
) => {
  await getBroadcast(client, query.id);

  return keysetPage(
    client,
    {
      table: broadcastRecipients,
      id: broadcastRecipients.id,
      createdAt: broadcastRecipients.createdAt,
      scope: eq(broadcastRecipients.broadcastId, query.id),
    },
    and(
      query.status ? eq(broadcastRecipients.status, query.status) : undefined,
      query.search ? ilike(broadcastRecipients.address, containsPattern(query.search)) : undefined,
    ),
    query,
    (where, orderBy, limit) =>
      client
        .select({ ...getTableColumns(broadcastRecipients), customerName })
        .from(broadcastRecipients)
        .leftJoin(customers, eq(customers.id, broadcastRecipients.customerId))
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );
};

export const listSuppressions = (
  client: Db,
  query: CursorQuery & { channel?: BroadcastChannel; reason?: SuppressionReason; search?: string },
) =>
  keysetPage(
    client,
    { table: suppressions, id: suppressions.id, createdAt: suppressions.createdAt },
    and(
      query.channel ? eq(suppressions.channel, query.channel) : undefined,
      query.reason ? eq(suppressions.reason, query.reason) : undefined,
      query.search ? ilike(suppressions.address, containsPattern(query.search)) : undefined,
    ),
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(suppressions)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

export const publishSuppressed = (
  client: Db,
  added: { row: typeof suppressions.$inferSelect; customerId: string | null }[],
) =>
  publishCoreEvents(
    client,
    added.map(({ row, customerId }) => ({
      type: 'core.broadcast.suppressed',
      ...(customerId && { subjectType: 'customer' as const, subjectId: customerId }),
      entityType: 'suppression',
      entityId: row.id,
      payload: {
        address: row.address,
        channel: row.channel,
        reason: row.reason,
        detail: row.detail,
        broadcastId: row.broadcastId,
        customerId,
      },
    })),
  );

/** Adds addresses by hand; one already suppressed keeps its reason. */
export const addSuppressions = async (
  client: Db,
  input: InferContractRouterInputs<typeof coreContract>['suppressions']['add'],
) => {
  const addresses = [...new Set(input.addresses)];

  const added = await client
    .insert(suppressions)
    .values(
      addresses.map((address) => ({
        id: newId(),
        channel: input.channel,
        address,
        reason: 'manual' as const,
        detail: input.detail ?? null,
        createdBy: callerUserId(),
      })),
    )
    .onConflictDoNothing()
    .returning();

  await publishSuppressed(
    client,
    added.map((row) => ({ row, customerId: null })),
  );

  return { added: added.length, addresses: added.map(({ address }) => address) };
};

/**
 * Lets broadcasts reach an address again. An unsubscribe or a spam complaint
 * was the person's own word, so only they can undo it (by subscribing again),
 * never a member.
 */
export const removeSuppression = async (client: Db, id: string) => {
  const removed = await client
    .delete(suppressions)
    .where(and(eq(suppressions.id, id), inArray(suppressions.reason, ['manual', 'bounced'])))
    .returning({ address: suppressions.address, reason: suppressions.reason });

  if (removed[0]) return removed[0];

  const [kept] = await client
    .select({ reason: suppressions.reason })
    .from(suppressions)
    .where(eq(suppressions.id, id))
    .limit(1);

  if (!kept) throw notFound('Suppressed address');

  throw fail('NOT_ALLOWED', `The person ${kept.reason} themselves; only they can undo it`);
};
