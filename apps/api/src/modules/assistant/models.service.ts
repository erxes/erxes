import { completeSimple } from '@earendil-works/pi-ai/compat';
import type { AssistantProvider } from '@erxes/core-contract';
import { requestOrgId, withOrg } from '@erxes/core-db';
import type { SecretRow } from '~/modules/secrets/vault';
import { notFound } from '~/http/errors';
import { findConnection, listConnections, openKey } from './connections.service';
import {
  buildModelCatalog,
  documentedModels,
  hasFixedCatalog,
  isUsableModel,
} from './modelCatalog';
import { modelDisplayName, modelThinking } from './modelThinking';
import { fetchProviderModels } from './providerModels';
import {
  DEFAULT_MODELS,
  describeProviderError,
  modelOf,
  providerLabel,
  unreadableKey,
} from './providers';

const providerModels = async (provider: AssistantProvider, secret: SecretRow) => {
  const apiKey = openKey(secret);

  if (apiKey === null) return { provider, models: [], error: unreadableKey(provider) };

  const listing = await fetchProviderModels(provider, apiKey);
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

export const listModels = async () => {
  const { data } = await withOrg(requestOrgId(), (tx) => listConnections(tx));

  return {
    data: await Promise.all(data.map((row) => providerModels(row.provider, row.secret))),
  };
};

const probe = async (provider: AssistantProvider, model: string, apiKey: string) => {
  const found = modelOf(provider, model);

  if (!found)
    return `"${model}" is not a model the assistant knows for ${providerLabel(provider)}.`;

  const answer = await completeSimple(
    found,
    { messages: [{ role: 'user', content: 'Reply with OK.', timestamp: Date.now() }] },
    { apiKey, maxTokens: 16, signal: AbortSignal.timeout(20_000) },
  );

  return answer.stopReason === 'error' || answer.stopReason === 'aborted'
    ? describeProviderError(provider, model, answer.errorMessage, apiKey)
    : null;
};

export const verifyModel = async (provider: AssistantProvider, model: string) => {
  const connection = await withOrg(requestOrgId(), (tx) => findConnection(tx, provider));

  if (!connection) throw notFound('Connection');

  const answer = (error: string | null) => ({ provider, model, ok: error === null, error });

  if (!isUsableModel(provider, model)) {
    return answer(
      `"${model}" is not a chat model the assistant can use with ${providerLabel(provider)}.`,
    );
  }

  const apiKey = openKey(connection.secret);

  if (apiKey === null) return answer(unreadableKey(provider));

  return answer(
    await probe(provider, model, apiKey).catch((error: unknown) =>
      describeProviderError(
        provider,
        model,
        error instanceof Error ? error.message : undefined,
        apiKey,
      ),
    ),
  );
};
