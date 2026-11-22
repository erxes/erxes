import { type Db, integrationConnections, integrationSubscriptions } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { publishCoreEvents } from '~/modules/events/events.service';
import { readSecret, removeSecretAs } from '~/modules/secrets/vault';
import { appOf, HOOK_CHANNEL } from './apps';
import { connectionsWithSecret } from './connections';
import type { KeyedIntegration } from './define';
import { freshKeys } from './oauth';

export type Subscription = typeof integrationSubscriptions.$inferSelect;

const MAX_FAILURES = 5;

export const subscriptionState = async (tx: Db, id: string) => {
  const [subscription] = await tx
    .select()
    .from(integrationSubscriptions)
    .where(eq(integrationSubscriptions.id, id))
    .limit(1);

  const app = subscription ? appOf(subscription.app) : null;

  if (!subscription || !app) return null;

  return { subscription, app, secret: await readSecret(tx, subscription.secretId) };
};

export const connectionOn = async (tx: Db, connectionId: string) => {
  const [connection] = await tx
    .select({ status: integrationConnections.status })
    .from(integrationConnections)
    .where(eq(integrationConnections.id, connectionId))
    .limit(1);

  return connection?.status === 'active';
};

export const connectionKeys = async (
  tx: Db,
  integration: KeyedIntegration,
  connectionId: string,
) => {
  const [row] = await connectionsWithSecret(tx)
    .where(eq(integrationConnections.id, connectionId))
    .limit(1);

  if (row?.key !== integration.key)
    throw fail('INVALID_STEP_INPUT', `Pick a ${integration.name} connection`);

  if (row.status !== 'active')
    throw fail('NOT_ACTIVE', `The ${integration.name} connection is off`);

  return freshKeys(tx, integration, row);
};

export const removeSubscription = async (tx: Db, subscription: Subscription) => {
  await tx.delete(integrationSubscriptions).where(eq(integrationSubscriptions.id, subscription.id));
  await removeSecretAs(tx, 'core', subscription.secretId);
};

export const delivered = (tx: Db, id: string) =>
  tx
    .update(integrationSubscriptions)
    .set({ lastDeliveryAt: sql`now()` })
    .where(eq(integrationSubscriptions.id, id));

export const markFailed = async (tx: Db, subscription: Subscription, error: string) => {
  const failures = subscription.failures + 1;
  const broken = failures >= MAX_FAILURES || subscription.channel === HOOK_CHANNEL;

  await tx
    .update(integrationSubscriptions)
    .set({
      failures,
      lastError: error.slice(0, 1000),
      status: broken ? 'broken' : subscription.status,
      updatedAt: sql`now()`,
    })
    .where(eq(integrationSubscriptions.id, subscription.id));

  if (!broken || subscription.status === 'broken') return failures;

  await publishCoreEvents(tx, {
    type: 'core.integration.trigger_failed',
    entityType: 'integration_subscription',
    entityId: subscription.id,
    payload: {
      app: subscription.app,
      connectionId: subscription.connectionId,
      triggers: subscription.triggers,
      error: error.slice(0, 1000),
    },
  });

  return failures;
};
