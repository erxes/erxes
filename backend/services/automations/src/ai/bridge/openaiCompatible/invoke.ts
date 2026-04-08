import { TAiBridgeInvokeInput, TAiBridgeInvokeResult } from '../types';
import {
  buildOpenAiCompatibleChatBody,
  formatOpenAiCompatibleError,
  requestOpenAiCompatible,
} from './request';
import { TOpenAiCompatibleChatCompletionResponse } from './types';

const extractTextValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (
    value &&
    typeof value === 'object' &&
    'value' in value &&
    typeof (value as { value?: unknown }).value === 'string'
  ) {
    return (value as { value: string }).value;
  }

  return '';
};

const extractResponseText = (
  response: TOpenAiCompatibleChatCompletionResponse | null,
) => {
  const content = response?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        return extractTextValue(part?.text);
      })
      .join('')
      .trim();
  }

  return '';
};

const extractRefusalText = (
  response: TOpenAiCompatibleChatCompletionResponse | null,
) => {
  const refusal = response?.choices?.[0]?.message?.refusal;

  if (typeof refusal === 'string') {
    return refusal.trim();
  }

  if (Array.isArray(refusal)) {
    return refusal
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        return part?.refusal || extractTextValue(part?.text);
      })
      .join('')
      .trim();
  }

  return '';
};

const formatEmptyResponseError = (
  response: TOpenAiCompatibleChatCompletionResponse | null,
) => {
  const refusal = extractRefusalText(response);

  if (refusal) {
    return `AI provider refused to answer: ${refusal}`;
  }

  const finishReason = response?.choices?.[0]?.finish_reason;
  const model = response?.model?.trim().toLowerCase() || '';

  if (finishReason === 'length') {
    if (model.startsWith('gpt-5')) {
      return 'AI provider returned no visible text because the response hit the completion token limit. GPT-5 models can spend that budget on internal reasoning first, so increase max tokens or shorten the prompt/context.';
    }

    return 'AI provider returned no text because the response hit the completion token limit. Increase max tokens or shorten the prompt.';
  }

  if (finishReason === 'content_filter') {
    return 'AI provider returned no text because the response was filtered.';
  }

  if (finishReason) {
    return `AI provider returned no text (finish_reason: ${finishReason}).`;
  }

  return 'AI provider returned an empty response.';
};

export const invokeOpenAiCompatible = async (
  input: TAiBridgeInvokeInput,
): Promise<TAiBridgeInvokeResult> => {
  const response =
    await requestOpenAiCompatible<TOpenAiCompatibleChatCompletionResponse>({
      connection: input.connection,
      runtime: input.runtime,
      path: '/chat/completions',
      method: 'POST',
      body: buildOpenAiCompatibleChatBody({
        connection: input.connection,
        runtime: input.runtime,
        messages: input.messages,
      }),
    });

  if (!response.ok) {
    throw new Error(formatOpenAiCompatibleError(response));
  }

  const text = extractResponseText(response.json);

  if (!text) {
    throw new Error(formatEmptyResponseError(response.json));
  }

  return {
    text,
    raw: response.json,
    usage: {
      inputTokens: response.json?.usage?.prompt_tokens,
      outputTokens: response.json?.usage?.completion_tokens,
      totalTokens: response.json?.usage?.total_tokens,
    },
  };
};
