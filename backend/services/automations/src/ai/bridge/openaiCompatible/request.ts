import fetch from 'node-fetch';
import { AI_AGENT_DEFAULTS } from '../../aiAgent/constants';
import {
  TAiBridgeConnection,
  TAiBridgeMessage,
  TAiBridgeRuntime,
  TAiBridgeToolDefinition,
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
  const timeoutMs = runtime.timeoutMs || AI_AGENT_DEFAULTS.timeoutMs;
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
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error(
        `AI provider timed out after ${timeoutMs}ms before returning a response.`,
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const usesDefaultOnlyTemperature = (model: string) => {
  const normalizedModel = model.trim().toLowerCase();

  return normalizedModel.startsWith('gpt-5');
};

const toOpenAiCompatibleMessage = (message: TAiBridgeMessage) => {
  if (message.role === 'assistant' && message.toolCalls?.length) {
    return {
      role: 'assistant',
      content: message.content || null,
      tool_calls: message.toolCalls.map((call) => ({
        id: call.id,
        type: 'function',
        function: {
          name: call.name,
          arguments: JSON.stringify(call.arguments || {}),
        },
      })),
    };
  }

  if (message.role === 'tool') {
    return {
      role: 'tool',
      tool_call_id: message.toolCallId,
      content: message.content,
    };
  }

  return { role: message.role, content: message.content };
};

export const buildOpenAiCompatibleChatBody = ({
  connection,
  runtime,
  messages,
  responseFormat,
  tools,
}: {
  connection: TAiBridgeConnection;
  runtime: TAiBridgeRuntime;
  messages: TAiBridgeMessage[];
  responseFormat?: 'json' | 'text';
  tools?: TAiBridgeToolDefinition[];
}) => {
  const body: Record<string, any> = {
    model: connection.model,
    messages: messages.map(toOpenAiCompatibleMessage),
    max_completion_tokens: runtime.maxTokens,
  };

  if (
    typeof runtime.temperature === 'number' &&
    !usesDefaultOnlyTemperature(connection.model)
  ) {
    body.temperature = runtime.temperature;
  }

  if (responseFormat === 'json') {
    body.response_format = { type: 'json_object' };
  }

  if (tools?.length) {
    body.tools = tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
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
