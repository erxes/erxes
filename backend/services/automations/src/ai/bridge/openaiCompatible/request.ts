import fetch from 'node-fetch';
import { AI_AGENT_DEFAULTS } from '../../aiAgent/constants';
import {
  TAiBridgeConnection,
  TAiBridgeMessage,
  TAiBridgeRuntime,
} from '../types';

type TOpenAiCompatibleRequestParams = {
  connection: TAiBridgeConnection;
  runtime: TAiBridgeRuntime;
  path: string;
  method?: 'GET' | 'POST';
  body?: any;
};

export type TOpenAiCompatibleResponse<TJson = any> = {
  ok: boolean;
  status: number;
  statusText: string;
  text: string;
  json: TJson | null;
};

const trimTrailingSlashes = (value: string) => {
  let end = value.length;

  while (end > 0 && value[end - 1] === '/') {
    end -= 1;
  }

  return value.slice(0, end);
};

export const normalizeOpenAiCompatibleBaseUrl = (
  connection: TAiBridgeConnection,
) => {
  return trimTrailingSlashes(
    connection.config.baseUrl?.trim() || AI_AGENT_DEFAULTS.baseUrl,
  );
};

const buildHeaders = (connection: TAiBridgeConnection) => {
  return {
    ...(connection.config.apiKey?.trim()
      ? { Authorization: `Bearer ${connection.config.apiKey}` }
      : {}),
    'Content-Type': 'application/json',
    ...(connection.config.headers || {}),
  };
};

export const requestOpenAiCompatible = async <TJson = any>({
  connection,
  runtime,
  path,
  method = 'GET',
  body,
}: TOpenAiCompatibleRequestParams): Promise<
  TOpenAiCompatibleResponse<TJson>
> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    runtime.timeoutMs || AI_AGENT_DEFAULTS.timeoutMs,
  );
  console.log({ body });
  try {
    const response = await fetch(
      `${normalizeOpenAiCompatibleBaseUrl(connection)}${path}`,
      {
        method,
        headers: buildHeaders(connection),
        signal: controller.signal,
        body: body ? JSON.stringify(body) : undefined,
      },
    );

    const text = await response.text();

    let json: TJson | null = null;

    if (text) {
      try {
        json = JSON.parse(text) as TJson;
      } catch (_error) {
        json = null;
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      text,
      json,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

const usesDefaultOnlyTemperature = (model: string) => {
  const normalizedModel = model.trim().toLowerCase();

  return normalizedModel.startsWith('gpt-5');
};

export const buildOpenAiCompatibleChatBody = ({
  connection,
  runtime,
  messages,
}: {
  connection: TAiBridgeConnection;
  runtime: TAiBridgeRuntime;
  messages: TAiBridgeMessage[];
}) => {
  const body: Record<string, any> = {
    model: connection.model,
    messages,
    max_completion_tokens: runtime.maxTokens,
  };

  if (
    typeof runtime.temperature === 'number' &&
    !usesDefaultOnlyTemperature(connection.model)
  ) {
    body.temperature = runtime.temperature;
  }

  return body;
};

export const formatOpenAiCompatibleError = (
  response: TOpenAiCompatibleResponse,
) => {
  const responseBody = response.text.trim();
  const loweredBody = responseBody.toLowerCase();
  const shouldHideBody =
    loweredBody.includes('authorization') ||
    loweredBody.includes('bearer ') ||
    loweredBody.includes('api key') ||
    loweredBody.includes('api-key') ||
    loweredBody.includes('api_key') ||
    loweredBody.includes('sk-');
  const safeBody = shouldHideBody
    ? '[provider error body hidden because it may contain secrets]'
    : responseBody;

  return `AI provider request failed with ${response.status} ${
    response.statusText
  }${safeBody ? `: ${safeBody}` : ''}`;
};
