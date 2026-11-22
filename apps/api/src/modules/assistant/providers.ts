import type { Api, Model } from '@earendil-works/pi-ai';
import { anthropicMessagesApi } from '@earendil-works/pi-ai/api/anthropic-messages.lazy';
import { openAICompletionsApi } from '@earendil-works/pi-ai/api/openai-completions.lazy';
import { openAIResponsesApi } from '@earendil-works/pi-ai/api/openai-responses.lazy';
import { createModels, createProvider, hasApi } from '@earendil-works/pi-ai/models';
import { anthropicProvider } from '@earendil-works/pi-ai/providers/anthropic';
import { kimiCodingProvider } from '@earendil-works/pi-ai/providers/kimi-coding';
import { moonshotaiProvider } from '@earendil-works/pi-ai/providers/moonshotai';
import { openaiProvider } from '@earendil-works/pi-ai/providers/openai';
import { openrouterProvider } from '@earendil-works/pi-ai/providers/openrouter';
import { xaiProvider } from '@earendil-works/pi-ai/providers/xai';
import type { AssistantProvider } from '@erxes/core-contract';
import { MODEL_PROVIDERS } from '@erxes/integrations/server';
import { listModelsDevModels } from './modelsDev';

export const providerLabel = (provider: AssistantProvider) => MODEL_PROVIDERS[provider].name;

export const DEFAULT_MODELS: Record<AssistantProvider, string> = {
  openai: 'gpt-5.6-luna',
  anthropic: 'claude-sonnet-5-5',
  openrouter: 'anthropic/claude-sonnet-5.5',
  kimi: 'kimi-k3',
  'kimi-code': 'kimi-for-coding',
  grok: 'grok-4.5',
};

interface Endpoint {
  provider: AssistantProvider;
  baseUrl: string;
}

const openrouterChats = () =>
  openrouterProvider()
    .getModels()
    .filter((model) => hasApi(model, 'openai-completions'));

/** The pi-ai catalog and API each erxes provider speaks with. */
const BASES = {
  openai: () => ({ known: openaiProvider().getModels(), api: openAIResponsesApi() }),
  anthropic: () => ({ known: anthropicProvider().getModels(), api: anthropicMessagesApi() }),
  openrouter: () => ({ known: openrouterChats(), api: openAICompletionsApi() }),
  kimi: () => ({ known: moonshotaiProvider().getModels(), api: openAICompletionsApi() }),
  'kimi-code': () => ({ known: kimiCodingProvider().getModels(), api: openAICompletionsApi() }),
  grok: () => ({ known: xaiProvider().getModels(), api: openAIResponsesApi() }),
} satisfies Record<AssistantProvider, unknown>;

/**
 * Every model the member can pick for the provider, at its connection's address: pi-ai's
 * catalog, then the models.dev ids and the default it lacks, with the settings of the catalog's
 * first model.
 */
const modelsOf = <TApi extends Api>(
  { provider, baseUrl }: Endpoint,
  known: readonly Model<TApi>[],
) => {
  const ids = new Set(known.map((model) => model.id));
  const [first] = known;

  const described = [
    ...listModelsDevModels(provider).map((model) => ({ id: model.id, reasoning: model.reasoning })),
    { id: DEFAULT_MODELS[provider], reasoning: false },
  ].flatMap(({ id, reasoning }) => {
    if (!first || ids.has(id)) return [];

    ids.add(id);

    return [{ ...first, id, name: id, reasoning }];
  });

  return [...known, ...described].map((model) => ({ ...model, provider, baseUrl }));
};

/** The connected providers as pi-ai sees them, each with its key and its connection's address. */
export const modelsFor = (keys: (Endpoint & { apiKey: string })[]) => {
  const models = createModels();

  for (const key of keys) {
    const { known, api } = BASES[key.provider]();
    const name = providerLabel(key.provider);

    models.setProvider(
      createProvider({
        id: key.provider,
        name,
        baseUrl: key.baseUrl,
        auth: { apiKey: { name, resolve: async () => ({ auth: { apiKey: key.apiKey } }) } },
        models: modelsOf(key, known),
        api,
      }),
    );
  }

  return models;
};

/** One model at the connection's address, for a request outside a conversation. */
export const modelOf = (endpoint: Endpoint, id: string) =>
  modelsOf(endpoint, BASES[endpoint.provider]().known).find((model) => model.id === id);

const MESSAGE_LIMIT = 200;

export const sanitizeProviderMessage = (message: unknown, apiKey: string) => {
  if (typeof message !== 'string') return '';

  const redacted = (apiKey ? message.split(apiKey).join('<key>') : message)
    .replace(/\b(sk|xai|key)[-_][\w*.-]+/gi, '<key>')
    .replace(/[A-Za-z0-9_*]{32,}/g, '<redacted>')
    .replace(/\s+/g, ' ')
    .trim();

  return redacted.length > MESSAGE_LIMIT ? `${redacted.slice(0, MESSAGE_LIMIT - 1)}…` : redacted;
};

export const providerErrorMessage = (body: unknown): unknown => {
  if (typeof body !== 'object' || body === null) return undefined;

  const error: unknown = 'error' in body ? body.error : undefined;

  if (typeof error === 'string') return error;

  if (typeof error === 'object' && error !== null && 'message' in error) return error.message;

  return 'message' in body ? body.message : undefined;
};

export const unreadableKey = (provider: AssistantProvider) =>
  `The ${providerLabel(provider)} key can't be decrypted on this server (its encryption key changed). Connect it again in Settings › Integrations.`;

export const rejectedKey = (provider: AssistantProvider) =>
  `${providerLabel(provider)} rejected the connected API key (401). Update it in Settings › Integrations.`;
