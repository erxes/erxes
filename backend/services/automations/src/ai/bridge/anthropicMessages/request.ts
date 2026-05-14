import fetch from 'node-fetch';
import {
  TAiBridgeConnection,
  TAiBridgeMessage,
  TAiBridgeRuntime,
} from '../types';

type TAnthropicMessagesRequestParams = {
  connection: TAiBridgeConnection;
  runtime: TAiBridgeRuntime;
  path: string;
  method?: 'GET' | 'POST';
  body?: any;
};

export type TAnthropicMessagesResponse<TJson = any> = {
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

const buildHeaders = (connection: TAiBridgeConnection) => ({
  'Content-Type': 'application/json',
  'anthropic-version': '2023-06-01',
  ...(connection.config.apiKey?.trim()
    ? {
        Authorization: `Bearer ${connection.config.apiKey}`,
        'x-api-key': connection.config.apiKey,
      }
    : {}),
  ...(connection.config.headers || {}),
});

export const requestAnthropicMessages = async <TJson = any>({
  connection,
  runtime,
  path,
  method = 'GET',
  body,
}: TAnthropicMessagesRequestParams): Promise<
  TAnthropicMessagesResponse<TJson>
> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), runtime.timeoutMs);

  try {
    const response = await fetch(
      `${trimTrailingSlashes(connection.config.baseUrl || '')}${path}`,
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
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error(
        `AI provider timed out after ${runtime.timeoutMs}ms before returning a response.`,
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const buildAnthropicMessagesBody = ({
  connection,
  runtime,
  messages,
}: {
  connection: TAiBridgeConnection;
  runtime: TAiBridgeRuntime;
  messages: TAiBridgeMessage[];
}) => {
  const system = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .filter(Boolean)
    .join('\n\n');
  const chatMessages = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content,
    }));

  return {
    model: connection.model,
    max_tokens: runtime.maxTokens,
    ...(typeof runtime.temperature === 'number'
      ? { temperature: runtime.temperature }
      : {}),
    ...(system ? { system } : {}),
    messages: chatMessages.length
      ? chatMessages
      : [{ role: 'user', content: 'Hello' }],
  };
};

export const formatAnthropicMessagesError = (
  response: TAnthropicMessagesResponse,
) => {
  const error = response.json as any;
  const message =
    error?.error?.message ||
    error?.message ||
    response.text ||
    response.statusText;

  return `AI provider request failed (${response.status}): ${message}`;
};
