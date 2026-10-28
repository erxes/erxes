import { ExpectedError } from 'erxes-api-shared/utils';
import type { IProviderModelEntry } from '@/agents/modelCatalog';
import { canOpenSealedSecrets, isSealedSecret } from '@/agents/secretBox';

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

/** Display names used in user-facing listing and probe errors. */
const BYOK_PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  grok: 'Grok',
  kimi: 'Kimi',
  'kimi-code': 'Kimi Code',
};

export const getByokProviderLabel = (provider: string): string =>
  BYOK_PROVIDER_LABELS[provider] ?? provider;

/** Why a stored key cannot be used, without revealing anything about it. */
export const describeUnreadableKey = (
  provider: string,
  stored: unknown,
): string => {
  const label = getByokProviderLabel(provider);

  if (!isSealedSecret(stored)) {
    return `No ${label} API key is saved. Add it in Settings → API key.`;
  }

  return canOpenSealedSecrets()
    ? `The saved ${label} key can't be decrypted on this server (its encryption secret changed). Re-enter it in Settings → API key.`
    : `Saved API keys can't be read because key encryption isn't configured on this server (JWT_TOKEN_SECRET). Ask an administrator to set it, then re-enter the ${label} key.`;
};

/** ExpectedError code for an endpoint that offers no model listing. */
export const MODEL_LIST_UNSUPPORTED = 'MODEL_LIST_UNSUPPORTED';

const PROVIDER_MESSAGE_LIMIT = 200;

/**
 * Makes a provider error message safe to show: the key itself and anything
 * shaped like a (masked) credential are removed before it is truncated.
 */
export const sanitizeProviderMessage = (
  message: unknown,
  apiKey: string,
): string => {
  if (typeof message !== 'string') {
    return '';
  }

  const withoutKey = apiKey ? message.split(apiKey).join('<key>') : message;
  const redacted = withoutKey
    .replace(/\b(sk|xai|key)[-_][\w*.-]+/gi, '<key>')
    // Long unbroken tokens; model ids contain dashes or dots, so they stay.
    .replace(/[A-Za-z0-9_*]{32,}/g, '<redacted>')
    .replace(/\s+/g, ' ')
    .trim();

  return redacted.length > PROVIDER_MESSAGE_LIMIT
    ? `${redacted.slice(0, PROVIDER_MESSAGE_LIMIT - 1)}…`
    : redacted;
};

/** OpenAI-, Anthropic- and Moonshot-style bodies all nest `error.message`. */
export const readProviderErrorMessage = (body: unknown): unknown => {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const { error, message } = body as { error?: unknown; message?: unknown };

  if (typeof error === 'string') {
    return error;
  }

  return error && typeof error === 'object'
    ? (error as { message?: unknown }).message
    : message;
};

/**
 * Turns a failed listing response into an actionable, key-free error. A key
 * that may chat but not list (OpenAI restricted keys need Models: Read,
 * `api.model.read`) is told so explicitly, because typing a model id still
 * works for it.
 */
const describeListingFailure = (
  provider: string,
  status: number,
  body: unknown,
  apiKey: string,
): ExpectedError => {
  const label = getByokProviderLabel(provider);
  const detail = sanitizeProviderMessage(
    readProviderErrorMessage(body),
    apiKey,
  );
  const suffix = detail ? ` ${label} said: "${detail}"` : '';

  if (
    /api\.model\.read|missing scopes?|insufficient permissions/i.test(detail)
  ) {
    return new ExpectedError(
      `This ${label} key can't list models (missing Models: Read permission). Type a model id to use it, or allow Models: Read for the key.`,
      'FORBIDDEN',
    );
  }

  if (status === 401) {
    return new ExpectedError(
      `${label} rejected the saved API key (401). Re-enter it in Settings → API key.${suffix}`,
      'UNAUTHORIZED',
    );
  }

  if (status === 403) {
    return new ExpectedError(
      `${label} refused to list models for this key (403). Type a model id to use it.${suffix}`,
      'FORBIDDEN',
    );
  }

  if (status === 404 || status === 405) {
    return new ExpectedError(
      `${label} has no model list endpoint (${status}).`,
      MODEL_LIST_UNSUPPORTED,
    );
  }

  if (status === 429) {
    return new ExpectedError(
      `${label} rate-limited the model list (429). Try again shortly.${suffix}`,
      'RATE_LIMITED',
    );
  }

  return new ExpectedError(
    `${label} could not list models (${status}).${suffix}`,
    status >= 500 ? 'BAD_GATEWAY' : 'VALIDATION_ERROR',
  );
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
      `Could not reach ${getByokProviderLabel(provider)} to list models.`,
      'BAD_GATEWAY',
    );
  }

  if (!response.ok) {
    throw describeListingFailure(
      provider,
      response.status,
      await response.json().catch(() => null),
      apiKey,
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
