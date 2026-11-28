import { integrationConnections, type Transaction, secrets } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { openSecret, type SecretRow, sealFor } from '~/modules/secrets/vault';
import { sealedValues, splitValues } from './define';
import { INTEGRATIONS } from './registry';

const log = logger.child({ component: 'integrations' });

const KEYS = new Map(
  INTEGRATIONS.flatMap((integration) =>
    integration.keys ? [[integration.key, integration.keys] as const] : [],
  ),
);

const split = ({ id, key, secret }: { id: string; key: string; secret: SecretRow }) => {
  const keys = KEYS.get(key);

  if (!keys) return [];

  try {
    const { settings, secrets: sealed } = splitValues(keys, sealedValues(openSecret(secret)));

    return [{ id, settings, secret, sealed: sealFor(secret, JSON.stringify(sealed)) }];
  } catch (error) {
    log.error({ err: error, connectionId: id, key }, 'connection values could not be split');

    return [];
  }
};

export const splitConnectionValues = async (tx: Transaction) => {
  const rows = await tx
    .select({ id: integrationConnections.id, key: integrationConnections.key, secret: secrets })
    .from(integrationConnections)
    .innerJoin(secrets, eq(secrets.id, integrationConnections.secretId));

  await inOrder(rows.flatMap(split), async ({ id, settings, secret, sealed }) => {
    await tx
      .update(integrationConnections)
      .set({ settings })
      .where(eq(integrationConnections.id, id));
    await tx.update(secrets).set(sealed).where(eq(secrets.id, secret.id));
  });
};
