import { type Db, requestOrgId, withOrg } from '@erxes/core-db';
import { type ConnectedProvider, connectedProviders } from './connectedProviders';
import { buildModelCatalog, documentedModels, hasFixedCatalog } from './modelCatalog';
import { modelDisplayName, modelThinking } from './modelThinking';
import { fetchProviderModels } from './providerModels';
import { DEFAULT_MODELS, unreadableKey } from './providers';

const providerModels = async ({ provider, key }: ConnectedProvider) => {
  if (!key) return { provider, models: [], error: unreadableKey(provider) };

  const listing = await fetchProviderModels(key);
  const fixed = hasFixedCatalog(provider);

  if (listing.error !== null && !(fixed && listing.unsupported)) {
    return { provider, models: [], error: listing.error };
  }

  const catalog = buildModelCatalog(
    provider,
    [...listing.entries, ...documentedModels(provider)],
    [DEFAULT_MODELS[provider]],
  );

  return {
    provider,
    error: null,
    models: catalog.map((model) => ({
      ...model,
      name: modelDisplayName(provider, model.id),
      thinking: modelThinking(provider, model.id),
    })),
  };
};

export const listProviders = async (client: Db) => ({
  data: (await connectedProviders(client)).map(({ provider }) => ({ provider })),
});

export const listModels = async () => {
  const connected = await withOrg(requestOrgId(), (tx) => connectedProviders(tx));

  return { data: await Promise.all(connected.map(providerModels)) };
};
