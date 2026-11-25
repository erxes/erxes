import type { coreContract, IntegrationScope, WithCorePayload } from '@erxes/core-contract';
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
import { releaseGateway } from '~/modules/payments/gateways.service';
import { isBank } from './banks';
import { clientOptions, connectionsWithSecret, keysOf, sealValues } from './connections';
import { ensureNameFree } from './connectionNames';
import { fieldsOf } from '@erxes/plugin-sdk/integrations';
import { type KeyedIntegration, splitValues } from './define';
import { connectionTurned, hooksSyncing, listenersOf } from './listeners';
import { keyedOf } from './registry';
import { ensureEditable, ownerFor } from './scopes';

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

export const connectionOf = async (client: Db, integration: KeyedIntegration, id: string) => {
  const [row] = await connectionsWithSecret(client, eq(integrationConnections.id, id)).limit(1);

  if (!row) throw notFound('Connection');

  if (row.key !== integration.key) {
    throw fail('KIND_CHANGED', 'Add a new connection to change its integration');
  }

  return row;
};

export const insertConnection = async (
  tx: Db,
  integration: KeyedIntegration,
  input: { id: string; name: string; ownerId: string | null; keys: Record<string, unknown> },
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
        ownerId: input.ownerId,
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

export const connect = async (input: Inputs['connect'] & { scope: IntegrationScope }) => {
  const integration = keyedOf(input.key);
  const ownerId = ownerFor(integration, input.scope);

  if (integration.oauth)
    throw fail('NOT_ALLOWED', `${integration.name} connects by signing in, not with keys`);

  const id = newId();
  const orgId = requestOrgId();

  await withOrg(orgId, (tx) => ensureNameFree(tx, integration, ownerId, input.name));

  const keys = await verified(
    orgId,
    integration,
    id,
    parsedKeys(integration, memberValues(integration, input.keys)),
  );

  return withOrg(orgId, (tx) =>
    insertConnection(tx, integration, { id, name: input.name, ownerId, keys }),
  );
};

export const updateConnection = async (input: Inputs['update']) => {
  const integration = keyedOf(input.key);
  const orgId = requestOrgId();

  const before = await withOrg(orgId, async (tx) => {
    const row = await connectionOf(tx, integration, input.id);

    ensureEditable(integration, row);

    if (input.name !== undefined)
      await ensureNameFree(tx, integration, row.ownerId, input.name, input.id);

    return row;
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
export const connectionChanged = (
  tx: Db,
  payload: WithCorePayload<'core.integration.changed'>['payload'],
) =>
  publishCoreEvents(tx, {
    type: 'core.integration.changed',
    entityType: 'integration_connection',
    entityId: payload.connectionId,
    payload,
  });

export const removeConnection = async (client: Db, key: string, id: string) => {
  const integration = keyedOf(key);
  const row = await connectionOf(client, integration, id);

  ensureEditable(integration, row);

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
