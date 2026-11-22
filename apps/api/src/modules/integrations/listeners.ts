import {
  automations,
  type Db,
  integrationConnections,
  integrationSubscriptions,
} from '@erxes/core-db';
import { and, asc, eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { inOrder } from '~/lib/sequence';
import { HOOK_CHANNEL, triggerOf } from './apps';
import { connectable } from './connectable';
import { enqueueSync } from './subscriptionSync';

const CONNECTION_OFF = 'The connection is off';

const listening = and(
  eq(automations.subscriptionId, integrationSubscriptions.id),
  eq(automations.status, 'active'),
);

const listeningAutomations = sql<{ id: string; name: string }[]>`coalesce((
  select json_agg(json_build_object('id', ${automations.id}, 'name', ${automations.name})
    order by ${automations.name})
  from ${automations} where ${listening}
), '[]'::json)`;

export const appSubscriptionsOf = async (client: Db, key: string) => {
  const app = connectable(key);

  const rows = await wholeList((limit) =>
    client
      .select({
        ...getTableColumns(integrationSubscriptions),
        connectionName: integrationConnections.name,
        automations: listeningAutomations,
      })
      .from(integrationSubscriptions)
      .innerJoin(
        integrationConnections,
        eq(integrationConnections.id, integrationSubscriptions.connectionId),
      )
      .where(eq(integrationConnections.key, app.key))
      .orderBy(asc(integrationConnections.createdAt), asc(integrationSubscriptions.createdAt))
      .limit(limit),
  );

  return {
    data: rows.map((row) => ({
      ...row,
      triggers: row.triggers.map((trigger) => ({
        key: trigger,
        label: triggerOf(row.app, trigger)?.label ?? trigger,
      })),
    })),
  };
};

export const listenersOf = async (client: Db, connectionIds: string[]) => {
  const rows = connectionIds.length
    ? await client
        .select({ connectionId: integrationSubscriptions.connectionId, name: automations.name })
        .from(automations)
        .innerJoin(
          integrationSubscriptions,
          eq(integrationSubscriptions.id, automations.subscriptionId),
        )
        .where(
          and(
            eq(automations.status, 'active'),
            inArray(integrationSubscriptions.connectionId, connectionIds),
          ),
        )
        .orderBy(asc(automations.name))
    : [];

  return (connectionId: string) =>
    rows.flatMap((row) => (row.connectionId === connectionId ? [row.name] : []));
};

export const hooksSyncing = async (client: Db, connectionId: string) => {
  const [row] = await client
    .select({ id: integrationSubscriptions.id })
    .from(integrationSubscriptions)
    .where(
      and(
        eq(integrationSubscriptions.connectionId, connectionId),
        eq(integrationSubscriptions.channel, HOOK_CHANNEL),
        eq(integrationSubscriptions.status, 'syncing'),
      ),
    )
    .limit(1);

  return Boolean(row);
};

export const connectionTurned = async (
  tx: Db,
  connectionId: string,
  status: (typeof integrationConnections.$inferSelect)['status'],
) => {
  if (status === 'disabled') {
    await tx
      .update(integrationSubscriptions)
      .set({ status: 'broken', lastError: CONNECTION_OFF, nextPollAt: null, updatedAt: sql`now()` })
      .where(eq(integrationSubscriptions.connectionId, connectionId));

    return;
  }

  const resumed = await tx
    .update(integrationSubscriptions)
    .set({
      status: 'syncing',
      lastError: null,
      failures: 0,
      nextPollAt: sql`case when ${integrationSubscriptions.channel} = ${HOOK_CHANNEL} then null else now() end`,
      updatedAt: sql`now()`,
    })
    .where(eq(integrationSubscriptions.connectionId, connectionId))
    .returning({ id: integrationSubscriptions.id, channel: integrationSubscriptions.channel });

  await inOrder(
    resumed.filter((row) => row.channel === HOOK_CHANNEL),
    (row) => enqueueSync(tx, row.id),
  );
};
