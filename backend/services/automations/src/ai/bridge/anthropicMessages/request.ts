import fetch from 'node-fetch';
import {
  TAiBridgeConnection,
  TAiBridgeMessage,
  TAiBridgeRuntime,
  TAiBridgeToolDefinition,
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

const toAnthropicMessage = (message: TAiBridgeMessage) => {
  if (message.role === 'assistant' && message.toolCalls?.length) {
    return {
      role: 'assistant',
      content: [
        ...(message.content
          ? [{ type: 'text', text: message.content }]
          : []),
        ...message.toolCalls.map((call) => ({
          type: 'tool_use',
          id: call.id,
          name: call.name,
          input: call.arguments || {},
        })),
      ],
    };
  }

  if (message.role === 'tool') {
    return {
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: message.toolCallId,
          content: message.content,
        },
      ],
    };
  }

  return {
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: message.content,
  };
};

export const buildAnthropicMessagesBody = ({
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
  const system = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .filter(Boolean)
    .join('\n\n');
  const chatMessages: any[] = messages
    .filter((message) => message.role !== 'system')
    .map(toAnthropicMessage);

  // The "{" prefill forces plain text, which breaks tool_use turns
  if (responseFormat === 'json' && !tools?.length) {
    // Assistant prefill forces the completion to continue a JSON object.
    chatMessages.push({ role: 'assistant', content: '{' });
  }

  return {
    model: connection.model,
    max_tokens: runtime.maxTokens,
    ...(typeof runtime.temperature === 'number'
      ? { temperature: runtime.temperature }
      : {}),
    ...(system ? { system } : {}),
    ...(tools?.length
      ? {
          tools: tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.parameters,
          })),
        }
      : {}),
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
