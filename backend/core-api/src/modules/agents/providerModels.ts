import { ExpectedError } from 'erxes-api-shared/utils';

/** Providers offered on the BYOK surface (single source for the whitelist). */
export const BYOK_PROVIDERS = ['openai', 'grok', 'kimi', 'kimi-code'] as const;

export type IByokProvider = (typeof BYOK_PROVIDERS)[number];

export const isByokProvider = (provider: string): boolean =>
  (BYOK_PROVIDERS as readonly string[]).includes(provider);

/**
 * Public per-provider models endpoints — the same base URLs the provider
 * defaults in `providers.ts` use, so a listed model id is always a valid
 * chat model for that provider. Secrets are never part of these constants.
 */
const PROVIDER_MODELS_ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/models',
  grok: 'https://api.x.ai/v1/models',
  kimi: 'https://api.moonshot.ai/v1/models',
  'kimi-code': 'https://api.kimi.com/coding/v1/models',
};

/**
 * Fetches one provider's model ids from its public /models endpoint using
 * the acting user's stored key. Both auth header styles are sent because
 * the Anthropic-protocol gateway (kimi-code) honors either, mirroring
 * `providers.ts`. The key is never included in any error message.
 */
export const fetchProviderModels = async ({
  provider,
  apiKey,
}: {
  provider: string;
  apiKey: string;
}): Promise<string[]> => {
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

  const payload = (await response
    .json()
    .catch(() => null)) as { data?: Array<{ id?: unknown }> } | null;
  const ids = (payload?.data ?? [])
    .map((item) => (typeof item?.id === 'string' ? item.id.trim() : ''))
    .filter((id) => id.length > 0);

  return Array.from(new Set(ids)).sort();
};
