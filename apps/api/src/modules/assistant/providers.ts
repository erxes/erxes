import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createXai } from '@ai-sdk/xai';
import type { AssistantProvider } from '@erxes/core-contract';
import type { LanguageModel } from 'ai';
import { z } from 'zod';
import { config } from '~/config';

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

export const createModel = (
  provider: AssistantProvider,
  model: string,
  apiKey: string,
): LanguageModel => {
  const baseURL = endpointOf(provider);

  switch (provider) {
    case 'openai':
      return createOpenAI({ apiKey, baseURL })(model);
    case 'grok':
      return createXai({ apiKey, baseURL })(model);
    case 'kimi':
      return createOpenAICompatible({ name: 'kimi', apiKey, baseURL, includeUsage: true })(model);
    case 'kimi-code':
      return createAnthropic({
        apiKey,
        baseURL,
        headers: { Authorization: `Bearer ${apiKey}` },
      })(model);
  }
};

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

const jsonOrNull = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const ProviderFailure = z.object({
  statusCode: z.number().optional(),
  responseBody: z.string().optional(),
});

export const describeProviderError = (
  provider: AssistantProvider,
  model: string,
  error: unknown,
  apiKey: string,
) => {
  const label = providerLabel(provider);
  const failure = ProviderFailure.safeParse(error).data;
  const status = failure?.statusCode;
  const body = failure?.responseBody;

  const detail = sanitizeProviderMessage(
    providerErrorMessage(body === undefined ? undefined : jsonOrNull(body)) ??
      (error instanceof Error ? error.message : undefined),
    apiKey,
  );

  if (status === 401) return `${label} rejected the saved API key (401). Save it again.`;

  const code = status === undefined ? '' : ` (${status})`;

  return `${label} could not answer with "${model}"${code}${detail ? `: ${detail}` : '.'}`;
};
