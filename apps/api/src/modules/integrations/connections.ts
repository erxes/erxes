import { type Db, integrationConnections, secrets } from '@erxes/core-db';
import { eq, getTableColumns, inArray } from 'drizzle-orm';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { openSecret, type WithSecret } from '~/modules/secrets/vault';
import { bankConfigOf } from './banks';
import { fieldsOf, type KeyedIntegration, type Keys } from './define';
import type { ClientOptions } from './gateways/types';
import { freshKeys } from './oauth';
import { keyedOf } from './registry';

export type ConnectionRow = WithSecret<typeof integrationConnections.$inferSelect>;

export const connectionsWithSecret = (client: Db) =>
  client
    .select({ ...getTableColumns(integrationConnections), secret: secrets })
    .from(integrationConnections)
    .innerJoin(secrets, eq(secrets.id, integrationConnections.secretId));

export const keysOf = (integration: KeyedIntegration, row: ConnectionRow) =>
  integration.keys.parse(JSON.parse(openSecret(row.secret)));

/**
 * What a connection's client is given: its token cache, the platform's QuickQR
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
  const options: ClientOptions = {
    cacheKey: id,
    ...(config.quickQr && { quickQr: config.quickQr }),
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

/**
 * The integration's client for the connection's keys, its bank connection read with `tx`.
 * A sign-in due to expire is renewed first.
 */
export const clientOf = async <C>(
  tx: Db,
  integration: KeyedIntegration<Keys, C>,
  row: ConnectionRow,
) => {
  const keys = integration.oauth ? await freshKeys(tx, integration, row) : keysOf(integration, row);

  return integration.client(keys, await clientOptions(tx, integration, row.id, keys));
};

export const visibleSettings = (integration: KeyedIntegration, keys: Record<string, unknown>) =>
  Object.fromEntries(
    fieldsOf(integration.keys).flatMap((field) =>
      field.type === 'secret' ? [] : [[field.key, keys[field.key]]],
    ),
  );

export const withSettings = <Row extends Pick<ConnectionRow, 'key'>>(
  row: Row,
  keys: Record<string, unknown>,
) => ({ ...row, settings: visibleSettings(keyedOf(row.key), keys) });

const shown = (row: ConnectionRow) => withSettings(row, keysOf(keyedOf(row.key), row));

export const listConnections = async (client: Db, keys: string[]) => ({
  data: (
    await wholeList((limit) =>
      connectionsWithSecret(client)
        .where(inArray(integrationConnections.key, keys))
        .orderBy(integrationConnections.createdAt)
        .limit(limit),
    )
  ).map(shown),
});
