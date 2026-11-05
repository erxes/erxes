import type { MastraModelConfig } from '@mastra/core/llm' with {
  'resolution-mode': 'import',
};
import type {
  IAiAgentConnection,
  IAiAgentConnectionConfig,
} from 'erxes-api-shared/core-modules';
import { openSecret } from '@/agents/secretBox';

/**
 * Turns a Core AI agent connection (Automation → Agents) into a Mastra model
 * config, mirroring the platform's provider resolution.
 *
 * Credentials live exclusively in the database, on the agent connection
 * document written by the Automation → Agents UI; this module never reads
 * environment variables. Precedence for every field: the per-agent connection
 * value first, then the public, non-secret provider default (endpoint/model
 * constants used only when the document omits them). OpenAI-compatible
 * providers are passed to Mastra as its native config object so the
 * framework builds and drives the client — except OpenAI itself on its
 * default endpoint, which omits the url so Mastra drives its native OpenAI
 * Responses client (see `createModelConfig`). `kimi-code` speaks the
 * Anthropic Messages protocol, so it is built through @ai-sdk/anthropic,
 * whose LanguageModel instances Mastra accepts directly.
 */

interface IProviderDefaults {
  baseUrl: string;
  model: string;
}

/** Public endpoint/model constants only — never secrets. */
export const PROVIDER_DEFAULTS: Record<string, IProviderDefaults> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-5.6-luna',
  },
  grok: {
    baseUrl: 'https://api.x.ai/v1',
    model: 'grok-4.5',
  },
  kimi: {
    baseUrl: 'https://api.moonshot.ai/v1',
    model: 'kimi-k3',
  },
  'kimi-code': {
    baseUrl: 'https://api.kimi.com/coding',
    model: 'kimi-for-coding',
  },
  'cloudflare-ai-gateway': {
    baseUrl: 'https://gateway.ai.cloudflare.com/v1',
    model: 'openai/gpt-5.6-luna',
  },
};

/**
 * The model the BYOK surface stores for a provider: always the public
 * provider default — users pick a provider and a key, never a model.
 */
export const getProviderDefaultModel = (provider: string): string => {
  const defaults = PROVIDER_DEFAULTS[provider];

  if (!defaults) {
    throw new Error(`Unsupported AI provider "${provider}"`);
  }

  return defaults.model;
};

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');

/**
 * @ai-sdk/anthropic posts to `${baseURL}/messages` and auto-appends "/v1"
 * only for its exact default host ("https://api.anthropic.com"); any custom
 * host is used verbatim. The platform's anthropicMessages bridge instead
 * always requests `${baseUrl}/v1/messages`. Pre-normalize custom
 * Anthropic-protocol hosts (kimi-code) to the versioned layout so both
 * clients reach the same endpoint, without double-appending an existing /v1.
 */
const buildAnthropicBaseUrl = (baseUrl: string): string => {
  const trimmed = trimSlashes(baseUrl);

  return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`;
};

/**
 * Cloudflare AI Gateway routes requests through
 * `{root}/{accountId}/{gatewayId}/{compat|openai}`; compat mode speaks the
 * OpenAI-compatible protocol. Account id, gateway id, and mode are sourced
 * only from the agent connection config.
 */
const buildCloudflareBaseUrl = ({
  config,
}: {
  config: IAiAgentConnectionConfig;
}): string => {
  const accountId = config.accountId?.trim() || '';
  const gatewayId = config.gatewayId?.trim() || '';
  const mode = config.mode || 'compat';
  const root =
    config.baseUrl?.trim() || PROVIDER_DEFAULTS['cloudflare-ai-gateway'].baseUrl;

  if (!accountId || !gatewayId) {
    return '';
  }

  return [
    root.replace(/\/+$/g, ''),
    trimSlashes(accountId),
    trimSlashes(gatewayId),
    mode === 'openai-provider' ? 'openai' : 'compat',
  ].join('/');
};

/**
 * Resolve one AI agent connection into the concrete values a request needs.
 */
export const resolveModelConnection = ({
  connection,
}: {
  connection: IAiAgentConnection;
}): {
  provider: string;
  model: string;
  baseUrl: string;
  apiKey: string;
  headers: Record<string, string>;
} => {
  const provider = connection.provider || 'cloudflare-ai-gateway';
  const defaults = PROVIDER_DEFAULTS[provider];

  if (!defaults) {
    throw new Error(`Unsupported AI provider "${provider}"`);
  }

  const config: IAiAgentConnectionConfig = connection.config || {};
  const model = connection.model?.trim() || defaults.model;
  // Stored keys are sealed at rest (secretBox); a legacy plaintext value
  // opens as-is and is re-sealed on the next model-layer read.
  const apiKey = openSecret(config.apiKey)?.trim() || '';
  const baseUrl =
    provider === 'cloudflare-ai-gateway'
      ? buildCloudflareBaseUrl({ config })
      : config.baseUrl?.trim() || defaults.baseUrl;

  // Only empty baseUrl possible: Cloudflare without account/gateway ids.
  if (provider === 'cloudflare-ai-gateway') {
    if (!baseUrl) {
      throw new Error(
        `AI provider "${provider}" needs accountId and gatewayId. Set them on the agent's connection under Automation -> Agents.`,
      );
    }
  } else if (!apiKey) {
    throw new Error(
      `AI provider "${provider}" has no API key. Add it to the agent's connection under Automation -> Agents.`,
    );
  }

  return {
    provider,
    model,
    baseUrl,
    apiKey,
    headers: config.headers || {},
  };
};

/** Build the Mastra model config for a resolved connection. */
export const createModelConfig = async (
  resolved: ReturnType<typeof resolveModelConnection>,
): Promise<MastraModelConfig> => {
  if (resolved.provider === 'kimi-code') {
    // Anthropic Messages protocol — Mastra's native config object only
    // covers OpenAI-compatible endpoints, so build an AI SDK model instead.
    // @ai-sdk/anthropic is ESM-only; load it dynamically from CommonJS.
    const { createAnthropic } = await import('@ai-sdk/anthropic');

    return createAnthropic({
      apiKey: resolved.apiKey,
      baseURL: buildAnthropicBaseUrl(resolved.baseUrl),
      headers: {
        // Mirror the platform bridge, which authenticates with BOTH header
        // styles because some Anthropic-protocol gateways honor only one.
        Authorization: `Bearer ${resolved.apiKey}`,
        // Connection-level headers keep priority over the derived one.
        ...resolved.headers,
      },
      // No `authToken` here: passing it alongside `apiKey` throws.
    })(resolved.model);
  }

  const id: `${string}/${string}` = `${resolved.provider}/${resolved.model}`;

  // OpenAI on its default endpoint must go through Mastra's native OpenAI
  // gateway (Responses API): the generic openai-compatible Chat Completions
  // client maps `maxOutputTokens` to `max_tokens`, which OpenAI's reasoning
  // models (the gpt-5 family) reject, and it cannot express
  // `max_completion_tokens`. Omitting `url` lets Mastra resolve `openai/*`
  // natively; the native client maps model settings correctly for those
  // models. A connection that explicitly overrides the endpoint (proxy)
  // keeps the openai-compatible path.
  if (
    resolved.provider === 'openai' &&
    resolved.baseUrl === PROVIDER_DEFAULTS.openai.baseUrl
  ) {
    return {
      id,
      apiKey: resolved.apiKey,
      headers: resolved.headers,
    };
  }

  return {
    id,
    url: resolved.baseUrl,
    apiKey: resolved.apiKey,
    headers: resolved.headers,
  };
};
