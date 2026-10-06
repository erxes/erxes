import { DISCORD_API_URL } from '@/integrations/discord/constants';

import {
  IDEMPOTENT_METHODS,
  MAX_NETWORK_RETRIES,
  MAX_RATE_LIMIT_RETRIES,
} from '@/integrations/discord/constants/request';

import {
  type TDiscordErrorBody,
  type TDiscordRequestArgs,
} from '@/integrations/discord/@types/request';

import { DiscordApiError } from '@/integrations/discord/errors/DiscordApiError';

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const sanitizeToken = (token?: string): string =>
  (token || '').replace(/\s/g, '');

const parseDiscordResponse = (text: string): unknown => {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
};

/** Retry transient network failures only for idempotent HTTP requests. */
export const fetchWithNetworkRetry = async (
  input: string,
  init?: RequestInit,
): Promise<Response> => {
  const method = (init?.method || 'GET').toUpperCase();
  const retryable = IDEMPOTENT_METHODS.has(method);
  const attemptFetch = async (attempt: number): Promise<Response> => {
    try {
      return await fetch(input, init);
    } catch (error) {
      if (!retryable || attempt >= MAX_NETWORK_RETRIES) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      return attemptFetch(attempt + 1);
    }
  };
  return attemptFetch(0);
};

const buildRequestHeaders = (
  token: string,
  form?: FormData,
): Record<string, string> => ({
  Authorization: `Bot ${token}`,
  ...(form ? {} : { 'Content-Type': 'application/json' }),
});

const buildRequestBody = (form: FormData | undefined, body: unknown) => {
  if (form) {
    return form;
  }
  return body === undefined ? undefined : JSON.stringify(body);
};

const resolveRetryAfterMs = (
  response: Response,
  errorBody: TDiscordErrorBody,
) => {
  const capMs = (retryAfterSec: number) =>
    Math.min(Math.max(retryAfterSec * 1000, 0), 60_000);

  const headerRetryHeader = response.headers.get('retry-after');
  const headerRetry =
    headerRetryHeader === null ? Number.NaN : Number(headerRetryHeader);
  if (Number.isFinite(headerRetry)) {
    return capMs(headerRetry);
  }

  const bodyRetry = Number(errorBody?.retry_after);
  if (Number.isFinite(bodyRetry)) {
    return capMs(bodyRetry);
  }

  return capMs(1);
};

export const discordRequest = async <T>({
  token,
  method,
  path,
  body,
  form,
}: TDiscordRequestArgs): Promise<T> => {
  const attemptRequest = async (attempt: number): Promise<T> => {
    const response = await fetchWithNetworkRetry(`${DISCORD_API_URL}${path}`, {
      method,
      headers: buildRequestHeaders(token, form),
      body: buildRequestBody(form, body),
    });

    const data = parseDiscordResponse(await response.text());
    const errorBody = data as TDiscordErrorBody;

    if (response.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
      const waitMs = resolveRetryAfterMs(response, errorBody);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return attemptRequest(attempt + 1);
    }

    if (!response.ok) {
      throw new DiscordApiError(
        response.status,
        `Discord API error ${response.status}: ${
          errorBody?.message || response.statusText
        }`,
        errorBody?.code,
      );
    }

    return data as T;
  };
  return attemptRequest(0);
};
