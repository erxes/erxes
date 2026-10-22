import type { MastraModelConfig } from '@mastra/core/llm' with {
  'resolution-mode': 'import',
};
import type { IAiAgentConnection } from 'erxes-api-shared/core-modules';
import { openSecret } from '@/agents/secretBox';

/**
 * Turns a BYOK agent connection into a Mastra model config.
 *
 * openai, grok and kimi go through Mastra's model router (`openai/*`, `xai/*`,
 * `moonshotai/*`), which builds each provider's own client and endpoint, so
 * provider options such as `xai.reasoningEffort` reach the provider. kimi-code
 * speaks the Anthropic Messages protocol on a host the router does not list,
 * so it is built through @ai-sdk/anthropic.
 *
 * Credentials come only from the connection document; this module never reads
 * environment variables.
 */

/** Default model per provider. Users pick a provider and a key, never a model. */
export const PROVIDER_DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-5.6-luna',
  grok: 'grok-4.5',
  kimi: 'kimi-k3',
  'kimi-code': 'kimi-for-coding',
};

/** Mastra model-router provider id for each router-backed provider. */
const ROUTER_PROVIDERS: Record<string, string> = {
  openai: 'openai',
  grok: 'xai',
  kimi: 'moonshotai',
};

const KIMI_CODE_BASE_URL = 'https://api.kimi.com/coding/v1';

export const getProviderDefaultModel = (provider: string): string => {
  const model = PROVIDER_DEFAULT_MODELS[provider];

  if (!model) {
    throw new Error(`Unsupported AI provider "${provider}"`);
  }

  return model;
};

/** Resolve one connection into the provider, model and key a request needs. */
export const resolveModelConnection = ({
  connection,
}: {
  connection: IAiAgentConnection;
}): { provider: string; model: string; apiKey: string } => {
  const provider = connection.provider;

  if (!PROVIDER_DEFAULT_MODELS[provider]) {
    throw new Error(`Unsupported AI provider "${provider}"`);
  }

  const model = connection.model?.trim() || PROVIDER_DEFAULT_MODELS[provider];
  // Stored keys are sealed at rest (secretBox); a legacy plaintext value
  // opens as-is and is re-sealed on the next model-layer read.
  const apiKey = openSecret(connection.config?.apiKey)?.trim() || '';

  if (!apiKey) {
    throw new Error(
      `AI provider "${provider}" has no API key. Add it to the agent's connection under Automation -> Agents.`,
    );
  }

  return { provider, model, apiKey };
};

/** Build the Mastra model config for a resolved connection. */
export const createModelConfig = async ({
  provider,
  model,
  apiKey,
}: ReturnType<typeof resolveModelConnection>): Promise<MastraModelConfig> => {
  if (provider === 'kimi-code') {
    // @ai-sdk/anthropic is ESM-only; load it dynamically from CommonJS.
    const { createAnthropic } = await import('@ai-sdk/anthropic');

    return createAnthropic({
      apiKey,
      baseURL: KIMI_CODE_BASE_URL,
      // The gateway honors either auth header; send both. Passing authToken
      // alongside apiKey throws, so the bearer goes in as a plain header.
      headers: { Authorization: `Bearer ${apiKey}` },
    })(model);
  }

  const id: `${string}/${string}` = `${ROUTER_PROVIDERS[provider]}/${model}`;

  return { id, apiKey };
};
