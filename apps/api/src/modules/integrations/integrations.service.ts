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
import { callerCan } from '~/http/access';
import { fail, invalidInput, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { releaseGateway } from '~/modules/payments/gateways.service';
import { saveSecret } from '~/modules/secrets/vault';
import {
  connectionsWithSecret,
  keysOf,
  listConnections,
  visibleSettings,
  withSettings,
} from './connections';
import { fieldsOf, type Integration, type KeyedIntegration } from './define';
import { INTEGRATIONS, keyedOf } from './registry';

const manages = (integration: Integration) => callerCan(integration.permission);

const connectable = (key: string) => {
  const integration = keyedOf(key);

  if (!manages(integration)) {
    throw fail('NOT_ALLOWED', "Your role doesn't allow this", {
      permission: integration.permission,
    });
  }

  return integration;
};

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
        fields: integration.keys ? fieldsOf(integration.keys) : [],
        payments: integration.payments ?? null,
        status: integration.status
          ? await integration.status(client)
          : connectionStatus(counts.get(integration.key)),
      })),
    ),
  };
};

export const integrationConnectionsOf = (client: Db, key: string) =>
  listConnections(client, [connectable(key).key]);

const parsedKeys = (integration: KeyedIntegration, keys: unknown) => {
  const parsed = integration.keys.safeParse(keys);

  if (!parsed.success) {
    throw invalidInput({
      issues: parsed.error.issues.map((issue) => ({ ...issue, path: ['keys', ...issue.path] })),
    });
  }

  return parsed.data;
};

const verified = async (
  integration: KeyedIntegration,
  id: string,
  keys: Record<string, unknown>,
) => {
  try {
    await integration.verify(keys, { cacheKey: id });
  } catch (error) {
    throw fail(
      'GATEWAY_REFUSED',
      `${integration.name} refused these credentials: ${error instanceof Error ? error.message : String(error)}`,
    );
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

export const connect = async (input: { key: string; name: string; keys: unknown }) => {
  const integration = connectable(input.key);
  const keys = parsedKeys(integration, input.keys);
  const id = newId();

  await verified(integration, id, keys);

  return withOrg(requestOrgId(), async (tx) => {
    const row = oneRow(
      await tx
        .insert(integrationConnections)
        .values({
          id,
          key: integration.key,
          name: input.name,
          secretId: await saveSecret(tx, JSON.stringify(keys)),
          createdBy: caller('user').userId,
        })
        .returning(),
    );

    await recordAudit(tx, {
      action: 'integration.connected',
      targetType: 'integration_connection',
      targetId: id,
      targetLabel: input.name,
      metadata: { key: integration.key, ...visibleSettings(integration, keys) },
    });

    return withSettings(row, keys);
  });
};

export const updateConnection = async (input: {
  key: string;
  id: string;
  name?: string;
  keys?: unknown;
  status?: (typeof integrationConnections.$inferSelect)['status'];
}) => {
  const integration = connectable(input.key);
  const keys = input.keys === undefined ? undefined : parsedKeys(integration, input.keys);
  const orgId = requestOrgId();
  const before = await withOrg(orgId, (tx) => connectionOf(tx, integration, input.id));

  if (keys) await verified(integration, input.id, keys);

  return withOrg(orgId, async (tx) => {
    if (keys) await saveSecret(tx, JSON.stringify(keys), before.secretId);

    const [row] = await tx
      .update(integrationConnections)
      .set({ name: input.name, status: input.status, updatedAt: sql`now()` })
      .where(eq(integrationConnections.id, input.id))
      .returning();

    if (!row) throw notFound('Connection');

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

  if (integration.payments) await releaseGateway(client, id);

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
