import { type Db, integrationConnections } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { bankConfigOf } from './banks';
import { connectionsWithSecret, keysOf } from './connections';
import type { KeyedIntegration } from './define';
import type { DriverOptions } from './gateways/types';
import { keyedOf } from './registry';

/**
 * What a connection's driver is given: its token cache, the platform's QuickQR
 * vendor account, and — for one that reads through a bank (`readsThrough`) —
 * the keys of the bank connection it names, read with `client`. Changing the
 * bank connection's keys changes them here too.
 */
export const driverOptions = async (
  client: Db,
  integration: KeyedIntegration,
  id: string,
  keys: Record<string, unknown>,
): Promise<DriverOptions> => {
  const options: DriverOptions = {
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
