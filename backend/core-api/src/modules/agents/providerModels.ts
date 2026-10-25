import { ExpectedError } from 'erxes-api-shared/utils';
import type { IProviderModelEntry } from '@/agents/modelCatalog';

/** Providers offered on the BYOK surface (single source for the whitelist). */
export const BYOK_PROVIDERS = ['openai', 'grok', 'kimi', 'kimi-code'] as const;

export type IByokProvider = (typeof BYOK_PROVIDERS)[number];

export const isByokProvider = (provider: string): boolean =>
  (BYOK_PROVIDERS as readonly string[]).includes(provider);

/**
 * Public per-provider models endpoints — the same hosts the provider
 * defaults in `providers.ts` use. A listing also contains non-chat models;
 * `modelCatalog.ts` filters it. Secrets are never part of these constants.
 */
const PROVIDER_MODELS_ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/models',
  grok: 'https://api.x.ai/v1/models',
  kimi: 'https://api.moonshot.ai/v1/models',
  'kimi-code': 'https://api.kimi.com/coding/v1/models',
};

const parseCreated = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  // Anthropic-protocol listings report an ISO `created_at` instead.
  if (typeof value === 'string') {
    const time = Date.parse(value);

    return Number.isNaN(time) ? undefined : Math.floor(time / 1000);
  }

  return undefined;
};

/**
 * Fetches one provider's raw model entries from its public /models endpoint
 * using the acting user's stored key. The listing is unfiltered;
 * `buildProviderModelCatalog` decides which entries are usable. Both auth header styles are sent because
 * the Anthropic-protocol gateway (kimi-code) honors either, mirroring
 * `providers.ts`. The key is never included in any error message.
 */
export const fetchProviderModels = async ({
  provider,
  apiKey,
}: {
  provider: string;
  apiKey: string;
}): Promise<IProviderModelEntry[]> => {
  const url = PROVIDER_MODELS_ENDPOINTS[provider];

  if (!url) {
    throw new ExpectedError(
      `Model listing is not supported for "${provider}".`,
      'VALIDATION_ERROR',
    );
  }

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ExpectedError(
      `Could not reach ${provider} to list models.`,
      'BAD_GATEWAY',
    );
  }

  if (!response.ok) {
    throw new ExpectedError(
      `Failed to list models for "${provider}" (${response.status}). Check your API key.`,
      response.status >= 500 ? 'BAD_GATEWAY' : 'VALIDATION_ERROR',
    );
  }

  const payload = (await response.json().catch(() => null)) as {
    data?: Array<{ id?: unknown; created?: unknown; created_at?: unknown }>;
  } | null;

  return (Array.isArray(payload?.data) ? payload.data : []).flatMap((item) => {
    const id = typeof item?.id === 'string' ? item.id.trim() : '';
    const created = parseCreated(item?.created ?? item?.created_at);

    return id ? [{ id, ...(created === undefined ? {} : { created }) }] : [];
  });
};
