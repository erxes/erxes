import type { IntegrationStatus } from '@erxes/core-contract';
import {
  caller,
  type Db,
  integrationConnections,
  newId,
  requestOrgId,
  withOrg,
} from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { fail, invalidInput, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { releaseGateway } from '~/modules/payments/gateways.service';
import { releaseBank } from '~/modules/banks/banks.service';
import { listPluginSettings } from '~/modules/payments/pluginSettings.service';
import { saveSecret } from '~/modules/secrets/vault';
import { isBank } from './banks';
import {
  connectionsWithSecret,
  keysOf,
  listConnections,
  visibleSettings,
  withSettings,
} from './connections';
import { connectable, manages } from './connectable';
import { fieldsOf, type KeyedIntegration } from './define';
import { connectionTurned, listenersOf } from './listeners';
import { callbackUrl, oauthClientSource } from './oauth';
import { driverOptions } from './options';
import { INTEGRATIONS, keyedOf } from './registry';

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
    .groupBy(integrationConnections.key);

  return new Map(rows.map((row) => [row.key, row.active]));
};

const connectionStatus = (active: number | undefined): IntegrationStatus => {
  if (active === undefined) return { state: 'not-set-up', count: null };

  return active ? { state: 'connected', count: active } : { state: 'off', count: null };
};

export const listIntegrations = async (client: Db) => {
  const counts = await activeCounts(client);

  return {
    data: await Promise.all(
      INTEGRATIONS.filter(manages).map(async (integration) => ({
        ...integration,
        dashboard: integration.dashboard ?? null,
        keyed: Boolean(integration.keys),
        fields: integration.keys && !integration.oauth ? fieldsOf(integration.keys) : [],
        payments: integration.payments ?? null,
        oauth: integration.oauth
          ? {
              client: await oauthClientSource(client, integration.key),
              callbackUrl: await callbackUrl(client),
            }
          : null,
        status: integration.status
          ? await integration.status(client)
          : connectionStatus(counts.get(integration.key)),
      })),
    ),
  };
};

const managedKeys = () =>
  INTEGRATIONS.flatMap((integration) =>
    integration.keys && manages(integration) ? [integration.key] : [],
  );

/** The integrations that read through a bank's connection (transfer payments). */
const readerKeys = () =>
  INTEGRATIONS.flatMap((integration) =>
    integration.keys && integration.readsThrough ? [integration.key] : [],
  );

export const integrationConnectionsOf = async (client: Db, key?: string) => {
  const { data } = await listConnections(client, key ? [connectable(key).key] : managedKeys());
  const { data: plugins } = await listPluginSettings(client);

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

    return [
      ...(connection.status === 'active' && keyedOf(connection.key).payments
        ? plugins.flatMap(({ title, allowedGatewayIds }) =>
            !allowedGatewayIds.length || allowedGatewayIds.includes(connection.id) ? [title] : [],
          )
        : []),
      ...listeners(connection.id),
    ];
  };

  return { data: data.map((connection) => ({ ...connection, usedBy: usedBy(connection) })) };
};

const parsedKeys = (integration: KeyedIntegration, keys: unknown) => {
  const parsed = integration.keys.safeParse(keys);

  if (!parsed.success) {
    throw invalidInput({
      issues: parsed.error.issues.map((issue) => ({ ...issue, path: ['keys', ...issue.path] })),
    });
  }

  return parsed.data;
};

/** What core filled (`hidden` fields: QuickQR's merchant id), kept when the keys change. */
const keptKeys = (integration: KeyedIntegration, keys: Record<string, unknown>) =>
  Object.fromEntries(
    fieldsOf(integration.keys).flatMap((field) =>
      field.type === 'hidden' && keys[field.key] !== undefined
        ? [[field.key, keys[field.key]]]
        : [],
    ),
  );

const refused = (integration: KeyedIntegration, error: unknown) =>
  fail(
    'GATEWAY_REFUSED',
    `${integration.name} refused these credentials: ${error instanceof Error ? error.message : String(error)}`,
  );

/**
 * The keys, checked with the service (read through their bank connection,
 * if any) and set up there (`register`): what to keep. Calls out: run it
 * outside any scope.
 */
const verified = async (
  orgId: string,
  integration: KeyedIntegration,
  id: string,
  keys: Record<string, unknown>,
) => {
  const options = await withOrg(orgId, (tx) => driverOptions(tx, integration, id, keys));

  try {
    await integration.verify(keys, options);

    return integration.register
      ? { ...keys, ...(await integration.register(keys, options)) }
      : keys;
  } catch (error) {
    throw refused(integration, error);
  }
};

const connectionOf = async (client: Db, integration: KeyedIntegration, id: string) => {
  const [row] = await connectionsWithSecret(client)
    .where(eq(integrationConnections.id, id))
    .limit(1);

  if (!row) throw notFound('Connection');

  if (row.key !== integration.key) {
    throw fail('KIND_CHANGED', 'Add a new connection to change its integration');
  }

  return row;
};

export const insertConnection = async (
  tx: Db,
  integration: KeyedIntegration,
  input: { id: string; name: string; keys: Record<string, unknown> },
) => {
  const row = oneRow(
    await tx
      .insert(integrationConnections)
      .values({
        id: input.id,
        key: integration.key,
        name: input.name,
        auth: integration.oauth ? 'oauth' : 'keys',
        secretId: await saveSecret(tx, JSON.stringify(input.keys)),
        createdBy: caller('user').userId,
      })
      .returning(),
  );

  await recordAudit(tx, {
    action: 'integration.connected',
    targetType: 'integration_connection',
    targetId: input.id,
    targetLabel: input.name,
    metadata: { key: integration.key, ...visibleSettings(integration, input.keys) },
  });

  return withSettings(row, input.keys);
};

export const connect = async (input: { key: string; name: string; keys: unknown }) => {
  const integration = connectable(input.key);

  if (integration.oauth)
    throw fail('NOT_ALLOWED', `${integration.name} connects by signing in, not with keys`);

  const id = newId();
  const orgId = requestOrgId();
  const keys = await verified(orgId, integration, id, parsedKeys(integration, input.keys));

  return withOrg(orgId, (tx) => insertConnection(tx, integration, { id, name: input.name, keys }));
};

export const updateConnection = async (input: {
  key: string;
  id: string;
  name?: string;
  keys?: unknown;
  status?: (typeof integrationConnections.$inferSelect)['status'];
}) => {
  const integration = connectable(input.key);
  const orgId = requestOrgId();
  const before = await withOrg(orgId, (tx) => connectionOf(tx, integration, input.id));

  const keys =
    input.keys === undefined
      ? undefined
      : await verified(orgId, integration, input.id, {
          ...keptKeys(integration, keysOf(integration, before)),
          ...parsedKeys(integration, input.keys),
        });

  return withOrg(orgId, async (tx) => {
    if (keys) await saveSecret(tx, JSON.stringify(keys), before.secretId);

    const [row] = await tx
      .update(integrationConnections)
      .set({ name: input.name, status: input.status, updatedAt: sql`now()` })
      .where(eq(integrationConnections.id, input.id))
      .returning();

    if (!row) throw notFound('Connection');

    if (input.status && input.status !== before.status)
      await connectionTurned(tx, row.id, input.status);

    await recordAudit(tx, {
      action: 'integration.updated',
      targetType: 'integration_connection',
      targetId: row.id,
      targetLabel: row.name,
      metadata: { key: row.key, credentialsChanged: Boolean(keys), status: input.status },
    });

    return withSettings(row, keys ?? keysOf(integration, before));
  });
};

export const removeConnection = async (client: Db, key: string, id: string) => {
  const integration = connectable(key);
  const row = await connectionOf(client, integration, id);
  const listening = (await listenersOf(client, [id]))(id);

  if (listening.length)
    throw fail(
      'CONNECTION_IN_USE',
      `Automations listen on ${row.name}: pause ${listening.join(', ')} first`,
      { automations: listening },
    );

  if (integration.payments) await releaseGateway(client, id);

  if (isBank(key)) await releaseBank(client, id);

  await client.delete(integrationConnections).where(eq(integrationConnections.id, id));
  await recordAudit(client, {
    action: 'integration.removed',
    targetType: 'integration_connection',
    targetId: id,
    targetLabel: row.name,
    metadata: { key },
  });

  return { ok: true as const };
};
