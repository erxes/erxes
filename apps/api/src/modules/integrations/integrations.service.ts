import type { coreContract, IntegrationStatus } from '@erxes/core-contract';
import type { InferContractRouterInputs } from '@orpc/contract';
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
import { publishCoreEvents } from '~/modules/events/events.service';
import { releaseBank } from '~/modules/banks/banks.service';
import { payingPlugins, releaseGateway } from '~/modules/payments/gateways.service';
import { INTEGRATION_ACTIONS } from './actions';
import { isBank } from './banks';
import {
  clientOptions,
  connectionsWithSecret,
  keysOf,
  listConnections,
  sealValues,
} from './connections';
import { connectable, manages } from './connectable';
import { ensureNameFree } from './connectionNames';
import { fieldsOf } from '@erxes/plugin-sdk/integrations';
import { type KeyedIntegration, splitValues } from './define';
import { connectionTurned, hooksSyncing, listenersOf } from './listeners';
import { oauthFacts } from './oauth';
import { pluginIntegrations } from './pluginIntegrations';
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

  const own = await Promise.all(
    INTEGRATIONS.filter(manages).map(async (integration) => ({
      ...integration,
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

const parsedKeys = (integration: KeyedIntegration, keys: unknown) => {
  const parsed = integration.keys.safeParse(keys);

  if (!parsed.success) {
    throw invalidInput({
      issues: parsed.error.issues.map((issue) => ({ ...issue, path: ['keys', ...issue.path] })),
    });
  }

  return parsed.data;
};

const memberValues = (integration: KeyedIntegration, values: Record<string, unknown>) => {
  const filled = new Set(
    fieldsOf(integration.keys).flatMap((field) => (field.type === 'hidden' ? [field.key] : [])),
  );

  return Object.fromEntries(Object.entries(values).filter(([key]) => !filled.has(key)));
};

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
  const options = await withOrg(orgId, (tx) => clientOptions(tx, integration, id, keys));

  try {
    const client = integration.client(keys, options);

    await integration.verify(client);

    return integration.register ? { ...keys, ...(await integration.register(client)) } : keys;
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
        ...(await sealValues(tx, integration, input.keys)),
        createdBy: caller('user').userId,
      })
      .returning(),
  );

  await recordAudit(tx, {
    action: 'integration.connected',
    targetType: 'integration_connection',
    targetId: input.id,
    targetLabel: input.name,
    metadata: { key: integration.key, ...row.settings },
  });
  await connectionChanged(tx, { key: integration.key, connectionId: row.id, change: 'connected' });

  return row;
};

type Inputs = InferContractRouterInputs<typeof coreContract>['integrations'];

export const connect = async (input: Inputs['connect']) => {
  const integration = connectable(input.key);

  if (integration.oauth)
    throw fail('NOT_ALLOWED', `${integration.name} connects by signing in, not with keys`);

  const id = newId();
  const orgId = requestOrgId();

  await withOrg(orgId, (tx) => ensureNameFree(tx, integration, input.name));

  const keys = await verified(
    orgId,
    integration,
    id,
    parsedKeys(integration, memberValues(integration, input.keys)),
  );

  return withOrg(orgId, (tx) => insertConnection(tx, integration, { id, name: input.name, keys }));
};

export const updateConnection = async (input: Inputs['update']) => {
  const integration = connectable(input.key);
  const orgId = requestOrgId();

  const before = await withOrg(orgId, async (tx) => {
    if (input.name !== undefined) await ensureNameFree(tx, integration, input.name, input.id);

    return connectionOf(tx, integration, input.id);
  });

  const kept: Record<string, unknown> = keysOf(integration, before);

  const given =
    input.keys &&
    Object.fromEntries(
      Object.entries(memberValues(integration, input.keys)).filter(
        ([key, value]) => value !== (kept[key] ?? null),
      ),
    );

  const keys =
    given &&
    (await verified(
      orgId,
      integration,
      input.id,
      parsedKeys(
        integration,
        Object.fromEntries(
          Object.entries({ ...kept, ...given }).filter(([, value]) => value !== null),
        ),
      ),
    ));

  const changed = given && splitValues(integration.keys, given);

  return withOrg(orgId, async (tx) => {
    const [row] = await tx
      .update(integrationConnections)
      .set({
        name: input.name,
        status: input.status,
        ...(keys && (await sealValues(tx, integration, keys, before.secretId))),
        updatedAt: sql`now()`,
      })
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
      metadata: {
        key: row.key,
        status: input.status,
        credentialsChanged: Boolean(changed && Object.keys(changed.secrets).length),
        ...changed?.settings,
      },
    });
    await connectionChanged(tx, { key: row.key, connectionId: row.id, change: row.status });

    return row;
  });
};

/**
 * `core.integration.changed`: plugins that use the integration's connections (decision 52) read
 * them again. `change`: `connected`, `active`, `disabled` or `removed`.
 */
const connectionChanged = (
  tx: Db,
  payload: { key: string; connectionId: string; change: string },
) =>
  publishCoreEvents(tx, {
    type: 'core.integration.changed',
    entityType: 'integration_connection',
    entityId: payload.connectionId,
    payload,
  });

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

  if (await hooksSyncing(client, id))
    throw fail(
      'CONNECTION_IN_USE',
      `${row.name} is still removing its webhooks: try again in a minute`,
      { automations: [] },
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
  await connectionChanged(client, { key, connectionId: id, change: 'removed' });

  return { ok: true as const };
};
