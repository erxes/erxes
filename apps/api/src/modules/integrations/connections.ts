import { type Db, integrationConnections, secrets } from '@erxes/core-db';
import { eq, getTableColumns, inArray } from 'drizzle-orm';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { openSecret, saveSecret, type WithSecret } from '~/modules/secrets/vault';
import { bankConfigOf } from './banks';
import type { Keys } from '@erxes/plugin-sdk/integrations';
import { type ClientOptions, type KeyedIntegration, sealedValues, splitValues } from './define';
import { freshKeys } from './oauth';
import { keyedOf } from './registry';

export type ConnectionRow = WithSecret<typeof integrationConnections.$inferSelect>;

export const connectionsWithSecret = (client: Db) =>
  client
    .select({ ...getTableColumns(integrationConnections), secret: secrets })
    .from(integrationConnections)
    .innerJoin(secrets, eq(secrets.id, integrationConnections.secretId));

export const keysOf = (integration: KeyedIntegration, row: ConnectionRow) =>
  integration.keys.parse({ ...row.settings, ...sealedValues(openSecret(row.secret)) });

export const sealValues = async (
  tx: Db,
  integration: KeyedIntegration,
  values: Record<string, unknown>,
  secretId?: string,
) => {
  const { settings, secrets: sealed } = splitValues(integration.keys, values);

  return { settings, secretId: await saveSecret(tx, JSON.stringify(sealed), secretId) };
};

/**
 * What a connection's client is given: its token cache, the address the server
 * sets for its service (ASSISTANT_*_URL), the platform's QuickQR
 * vendor account, and, for one that reads through a bank (`readsThrough`), the
 * keys of the bank connection it names, read with `client`. Changing the bank
 * connection's keys changes them here too.
 */
export const clientOptions = async (
  client: Db,
  integration: KeyedIntegration,
  id: string,
  keys: Record<string, unknown>,
): Promise<ClientOptions> => {
  const baseUrl = config.assistant.endpoints[integration.key];

  const options: ClientOptions = {
    cacheKey: id,
    ...(config.quickQr && { quickQr: config.quickQr }),
    ...(baseUrl && { baseUrl }),
  };

  if (!integration.readsThrough) return options;

  const bankKey = integration.readsThrough;
  const bankName = keyedOf(bankKey).name;
  const connectionId = typeof keys.connectionId === 'string' ? keys.connectionId : '';

  const [row] = await connectionsWithSecret(client)
    .where(eq(integrationConnections.id, connectionId))
    .limit(1);

  if (row?.key !== bankKey)
    throw fail('GATEWAY_REFUSED', `Pick one of your ${bankName} connections`);

  return { ...options, bank: bankConfigOf(row.key, keysOf(keyedOf(row.key), row)) };
};

/** The integration's client for the connection's keys, its bank connection read with `tx`. */
export const clientOf = async <C>(
  tx: Db,
  integration: KeyedIntegration<Keys, C>,
  row: ConnectionRow,
) => {
  const keys = integration.oauth ? await freshKeys(tx, integration, row) : keysOf(integration, row);

  return integration.client(keys, await clientOptions(tx, integration, row.id, keys));
};

export const listConnections = async (client: Db, keys: string[]) => ({
  data: await wholeList((limit) =>
    client
      .select()
      .from(integrationConnections)
      .where(inArray(integrationConnections.key, keys))
      .orderBy(integrationConnections.createdAt)
      .limit(limit),
  ),
});
