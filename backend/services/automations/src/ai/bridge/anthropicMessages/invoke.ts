import { TAiBridgeInvokeInput, TAiBridgeInvokeResult } from '../types';
import {
  buildAnthropicMessagesBody,
  formatAnthropicMessagesError,
  requestAnthropicMessages,
} from './request';

const extractText = (response: any) => {
  const content = response?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        return part?.text || '';
      })
      .join('')
      .trim();
  }

  return '';
};

export const invokeAnthropicMessages = async (
  input: TAiBridgeInvokeInput,
): Promise<TAiBridgeInvokeResult> => {
  const response = await requestAnthropicMessages<any>({
    connection: input.connection,
    runtime: input.runtime,
    path: '/v1/messages',
    method: 'POST',
    body: buildAnthropicMessagesBody(input),
  });

  if (!response.ok) {
    throw new Error(formatAnthropicMessagesError(response));
  }

  const text = extractText(response.json);

  if (!text) {
    throw new Error('AI provider returned an empty response.');
  }

  return {
    text,
    raw: response.json,
    usage: {
      inputTokens: response.json?.usage?.input_tokens,
      outputTokens: response.json?.usage?.output_tokens,
      totalTokens:
        typeof response.json?.usage?.input_tokens === 'number' &&
        typeof response.json?.usage?.output_tokens === 'number'
          ? response.json.usage.input_tokens + response.json.usage.output_tokens
          : undefined,
    },
  };
};
