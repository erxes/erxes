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
import { ownApp } from './githubApp';
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

/** Connected, or off; before any connection, ready once the organisation set up its own app. */
const connectionStatus = (active: number | undefined, appSet: boolean): IntegrationStatus => {
  if (active === undefined) return { state: appSet ? 'ready' : 'not-set-up', count: null };

  return active ? { state: 'connected', count: active } : { state: 'off', count: null };
};

/** The organisation saved its own app for it: an OAuth app, or its GitHub App. */
const ownAppSet = async (client: Db, key: string, oauth: { client: string | null } | null) =>
  oauth?.client === 'organization' || (key === 'github' && (await ownApp(client)) !== null);

export const listIntegrations = async (client: Db) => {
  const counts = await activeCounts(client);

  const own = await Promise.all(
    INTEGRATIONS.filter(listed).map(async (integration) => {
      const oauth = integration.oauth ? await oauthFacts(client, integration.key) : null;

      return {
        ...integration,
        scopes: [...scopesOf(integration)],
        plugin: null,
        connection: null,
        dashboard: integration.dashboard ?? null,
        keyed: Boolean(integration.keys),
        fields: integration.keys && !integration.oauth ? fieldsOf(integration.keys) : [],
        payments: integration.payments ?? null,
        sms: Boolean(integration.smsSending),
        oauth,
        status: integration.status
          ? await integration.status(client)
          : connectionStatus(
              counts.get(integration.key),
              await ownAppSet(client, integration.key, oauth),
            ),
        actions: INTEGRATION_ACTIONS.filter(
          (action) => action.integration?.key === integration.key,
        ).map(({ type, label, description }) => ({ type, label, description })),
      };
    }),
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
