import type { AssistantProvider } from '@erxes/core-contract';
import { requestOrgId, withOrg } from '@erxes/core-db';
import { streamText } from 'ai';
import { notFound } from '~/http/errors';
import { findConnection, listConnections, openKey } from './connections.service';
import {
  buildModelCatalog,
  documentedModels,
  hasFixedCatalog,
  isUsableModel,
} from './modelCatalog';
import {
  anthropicThinking,
  MIN_ANTHROPIC_THINKING_BUDGET,
  modelDisplayName,
  modelThinking,
} from './modelThinking';
import { fetchProviderModels } from './providerModels';
import {
  createModel,
  DEFAULT_MODELS,
  describeProviderError,
  providerLabel,
  unreadableKey,
} from './providers';

const providerModels = async (provider: AssistantProvider, sealedKey: string) => {
  const apiKey = openKey(sealedKey);

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
    data: await Promise.all(data.map((row) => providerModels(row.provider, row.sealedKey))),
  };
};

const ACCEPTED = new Set(['text-delta', 'reasoning-delta', 'finish-step', 'finish']);

const probe = async (provider: AssistantProvider, model: string, apiKey: string) => {
  const thinking = provider === 'kimi-code';

  const result = streamText({
    model: createModel(provider, model, apiKey),
    prompt: 'Reply with OK.',
    maxOutputTokens: thinking ? MIN_ANTHROPIC_THINKING_BUDGET + 16 : 16,
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(20_000),
    ...(thinking ? { providerOptions: anthropicThinking(MIN_ANTHROPIC_THINKING_BUDGET) } : {}),
  });

  for await (const part of result.stream) {
    if (part.type === 'error') return describeProviderError(provider, model, part.error, apiKey);

    if (ACCEPTED.has(part.type)) return null;
  }

  return `${providerLabel(provider)} sent no response while checking "${model}". Try again.`;
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

  const apiKey = openKey(connection.sealedKey);

  if (apiKey === null) return answer(unreadableKey(provider));

  return answer(
    await probe(provider, model, apiKey).catch((error: unknown) =>
      describeProviderError(provider, model, error, apiKey),
    ),
  );
};
