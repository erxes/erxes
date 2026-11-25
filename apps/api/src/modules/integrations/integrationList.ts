import type { IntegrationStatus } from '@erxes/core-contract';
import { type Db, integrationConnections } from '@erxes/core-db';
import { fieldsOf } from '@erxes/plugin-sdk/integrations';
import { sql } from 'drizzle-orm';
import { payingPlugins } from '~/modules/payments/gateways.service';
import { INTEGRATION_ACTIONS } from './actions';
import { isBank } from './banks';
import { manages } from './connectable';
import { listConnections } from './connections';
import { listenersOf } from './listeners';
import { oauthFacts } from './oauth';
import { pluginIntegrations } from './pluginIntegrations';
import { INTEGRATIONS, keyedOf } from './registry';
import { listable, listed, scopesOf, withinReach } from './scopes';

const activeCounts = async (client: Db) => {
  const rows = await client
    .select({
      key: integrationConnections.key,
      active:
        sql<number>`count(*) filter (where ${integrationConnections.status} = 'active')`.mapWith(
          Number,
        ),
    })
    .from(integrationConnections)
    .where(withinReach())
    .groupBy(integrationConnections.key);

  return new Map(rows.map((row) => [row.key, row.active]));
};

const connectionStatus = (active: number | undefined): IntegrationStatus => {
  if (active === undefined) return { state: 'not-set-up', count: null };

  return active ? { state: 'connected', count: active } : { state: 'off', count: null };
};

export const listIntegrations = async (client: Db) => {
  const counts = await activeCounts(client);

  const own = await Promise.all(
    INTEGRATIONS.filter(listed).map(async (integration) => ({
      ...integration,
      scopes: [...scopesOf(integration)],
      plugin: null,
      connection: null,
      dashboard: integration.dashboard ?? null,
      keyed: Boolean(integration.keys),
      fields: integration.keys && !integration.oauth ? fieldsOf(integration.keys) : [],
      payments: integration.payments ?? null,
      sms: Boolean(integration.smsSending),
      oauth: integration.oauth ? await oauthFacts(client, integration.key) : null,
      status: integration.status
        ? await integration.status(client)
        : connectionStatus(counts.get(integration.key)),
      actions: INTEGRATION_ACTIONS.filter(
        (action) => action.integration?.key === integration.key,
      ).map(({ type, label, description }) => ({ type, label, description })),
    })),
  );

  return { data: [...own, ...(await pluginIntegrations(client))] };
};

const listedKeys = () =>
  INTEGRATIONS.flatMap((integration) =>
    integration.keys && listed(integration) ? [integration.key] : [],
  );

/** The member's own connections, and the organisation's of the integrations their role manages. */
const usableConnections = async (client: Db, keys: string[]) =>
  (await listConnections(client, keys)).data.filter(
    (connection) => connection.ownerId !== null || manages(keyedOf(connection.key)),
  );

/** The integrations that read through a bank's connection (transfer payments). */
const readerKeys = () =>
  INTEGRATIONS.flatMap((integration) =>
    integration.keys && integration.readsThrough ? [integration.key] : [],
  );

export const integrationConnectionsOf = async (client: Db, key?: string) => {
  const data = await usableConnections(client, key ? [listable(key).key] : listedKeys());
  const plugins = await payingPlugins(client);

  // A bank connection is used by the payments that read their statement through it.
  const readers = data.some((connection) => isBank(connection.key))
    ? (await listConnections(client, readerKeys())).data.filter(
        (connection) => connection.status === 'active',
      )
    : [];

  const listeners = await listenersOf(
    client,
    data.map((connection) => connection.id),
  );

  const usedBy = (connection: (typeof data)[number]) => {
    if (isBank(connection.key))
      return readers.flatMap((reader) =>
        reader.settings.connectionId === connection.id ? [reader.name] : [],
      );

    // Gateways serve the whole organisation: every plugin taking payments, while it is on.
    return [
      ...(connection.status === 'active' && keyedOf(connection.key).payments ? plugins : []),
      ...listeners(connection.id),
    ];
  };

  return { data: data.map((connection) => ({ ...connection, usedBy: usedBy(connection) })) };
};
