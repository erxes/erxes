import type { Api, Model } from '@earendil-works/pi-ai';
import { openAICompletionsApi } from '@earendil-works/pi-ai/api/openai-completions.lazy';
import { openAIResponsesApi } from '@earendil-works/pi-ai/api/openai-responses.lazy';
import { createModels, createProvider } from '@earendil-works/pi-ai/models';
import { kimiCodingProvider } from '@earendil-works/pi-ai/providers/kimi-coding';
import { moonshotaiProvider } from '@earendil-works/pi-ai/providers/moonshotai';
import { openaiProvider } from '@earendil-works/pi-ai/providers/openai';
import { xaiProvider } from '@earendil-works/pi-ai/providers/xai';
import type { AssistantProvider } from '@erxes/core-contract';
import { config } from '~/config';
import { listModelsDevModels } from './modelsDev';

const LABELS: Record<AssistantProvider, string> = {
  openai: 'OpenAI',
  grok: 'Grok',
  kimi: 'Kimi',
  'kimi-code': 'Kimi Code',
};

export const providerLabel = (provider: AssistantProvider) => LABELS[provider];

export const DEFAULT_MODELS: Record<AssistantProvider, string> = {
  openai: 'gpt-5.6-luna',
  grok: 'grok-4.5',
  kimi: 'kimi-k3',
  'kimi-code': 'kimi-for-coding',
};

export const endpointOf = (provider: AssistantProvider) => config.assistant.endpoints[provider];

/** The pi-ai provider each erxes provider speaks like: its model catalog and API. */
const BASES = {
  openai: () => ({ base: openaiProvider(), api: openAIResponsesApi() }),
  grok: () => ({ base: xaiProvider(), api: openAIResponsesApi() }),
  kimi: () => ({ base: moonshotaiProvider(), api: openAICompletionsApi() }),
  'kimi-code': () => ({ base: kimiCodingProvider(), api: openAICompletionsApi() }),
} satisfies Record<AssistantProvider, unknown>;

/**
 * Every model the member can pick for `provider`, at erxes' endpoint: pi-ai's catalog, then the
 * models.dev ids and the default it lacks, with the settings of the catalog's first model.
 */
const modelsOf = <TApi extends Api>(provider: AssistantProvider, known: readonly Model<TApi>[]) => {
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

  return [...known, ...described].map((model) => ({
    ...model,
    provider,
    baseUrl: endpointOf(provider),
  }));
};

/** The member's providers as pi-ai sees them, each with its key and erxes' endpoint. */
export const modelsFor = (keys: { provider: AssistantProvider; apiKey: string }[]) => {
  const models = createModels();

  for (const { provider, apiKey } of keys) {
    const { base, api } = BASES[provider]();

    models.setProvider(
      createProvider({
        id: provider,
        name: providerLabel(provider),
        baseUrl: endpointOf(provider),
        auth: {
          apiKey: { name: providerLabel(provider), resolve: async () => ({ auth: { apiKey } }) },
        },
        models: modelsOf(provider, base.getModels()),
        api,
      }),
    );
  }

  return models;
};

/** One model at erxes' endpoint, for a request outside a conversation. */
export const modelOf = (provider: AssistantProvider, id: string) =>
  modelsOf(provider, BASES[provider]().base.getModels()).find((model) => model.id === id);

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
  `The saved ${providerLabel(provider)} key can't be decrypted on this server (its encryption key changed). Save it again.`;

/** What a member reads when a provider fails: pi-ai's error message without the key. */
export const describeProviderError = (
  provider: AssistantProvider,
  model: string,
  message: string | undefined,
  apiKey: string,
) => {
  const label = providerLabel(provider);
  const detail = sanitizeProviderMessage(message, apiKey);

  if (/\b401\b/.test(detail)) return `${label} rejected the saved API key (401). Save it again.`;

  return `${label} could not answer with "${model}"${detail ? `: ${detail}` : '.'}`;
};
