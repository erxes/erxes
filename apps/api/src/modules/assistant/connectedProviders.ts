import { MODEL_PROVIDERS, type ModelClient } from '@erxes/integrations/server';
import { AssistantProvider } from '@erxes/core-contract';
import { type Db, integrationConnections } from '@erxes/core-db';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { logger } from '~/logger';
import {
  clientOf,
  type ConnectionRow,
  connectionsWithSecret,
} from '~/modules/integrations/connections';

const log = logger.child({ component: 'assistant' });

export type ProviderKey = ModelClient & { provider: AssistantProvider };

export interface ConnectedProvider {
  provider: AssistantProvider;
  key: ProviderKey | null;
}

const activeRows = (client: Db) =>
  wholeList((limit) =>
    connectionsWithSecret(client)
      .where(
        and(
          inArray(integrationConnections.key, AssistantProvider.options),
          eq(integrationConnections.status, 'active'),
        ),
      )
      .orderBy(asc(integrationConnections.createdAt), asc(integrationConnections.id))
      .limit(limit),
  );

const opened = async (
  client: Db,
  provider: AssistantProvider,
  row: ConnectionRow,
): Promise<ConnectedProvider> => {
  try {
    const key = await clientOf(client, MODEL_PROVIDERS[provider], row);

    return { provider, key: { ...key, provider } };
  } catch (error) {
    log.warn(
      { err: error, provider, connectionId: row.id },
      'assistant: an AI provider connection does not open',
    );

    return { provider, key: null };
  }
};

export const connectedProviders = async (client: Db) => {
  const rows = await activeRows(client);
  const seen = new Set<AssistantProvider>();

  const firsts = rows.flatMap((row) => {
    const provider = AssistantProvider.parse(row.key);

    if (seen.has(provider)) return [];

    seen.add(provider);

    return [{ provider, row }];
  });

  return Promise.all(firsts.map(({ provider, row }) => opened(client, provider, row)));
};
