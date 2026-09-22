import {
  TAiBridgeInvokeInput,
  TAiBridgeInvokeResult,
  TAiBridgeToolCall,
} from '../types';
import {
  buildAnthropicMessagesBody,
  formatAnthropicMessagesError,
  requestAnthropicMessages,
} from './request';

const extractToolCalls = (response: any): TAiBridgeToolCall[] => {
  if (!Array.isArray(response?.content)) {
    return [];
  }

  return response.content
    .filter((part: any) => part?.type === 'tool_use' && part?.name)
    .map((part: any, index: number) => ({
      id: part.id || `call_${index}`,
      name: part.name,
      arguments:
        part.input && typeof part.input === 'object' ? part.input : {},
    }));
};

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

/**
 * Reasoning models bill thinking against the same budget as the answer, so a
 * run can spend every token before writing a visible word. The provider says
 * so in `stop_reason` and `usage`; say it back plainly instead of calling it
 * an empty response.
 */
const formatEmptyResponseError = (response: any, maxTokens?: number) => {
  const stopReason = response?.stop_reason;
  const usage = response?.usage || {};
  const outputTokens = usage.output_tokens;
  const thinkingTokens = usage.output_tokens_details?.thinking_tokens;
  const budget = maxTokens ?? outputTokens;

  const blocks = Array.isArray(response?.content) ? response.content : [];
  const thinkingOnly =
    blocks.length > 0 && blocks.every((part: any) => part?.type === 'thinking');

  if (stopReason === 'max_tokens') {
    if (thinkingTokens) {
      return (
        `AI provider hit the token limit without writing anything: it spent ` +
        `${thinkingTokens} of its ${budget} output tokens on internal thinking ` +
        `and produced 0 characters of visible text. Raise maxTokens well above ` +
        `the model's thinking budget, or use a model without extended thinking.`
      );
    }

    return (
      `AI provider hit the token limit (${outputTokens}/${budget} output ` +
      `tokens) before producing any visible text. Raise maxTokens or shorten ` +
      `the prompt.`
    );
  }

  if (thinkingOnly) {
    return (
      `AI provider returned only internal thinking ` +
      `(${thinkingTokens ?? outputTokens} tokens) and no visible text ` +
      `(stop_reason: ${stopReason ?? 'none'}). Raise maxTokens so the answer ` +
      `fits after the thinking, or use a model without extended thinking.`
    );
  }

  if (stopReason === 'refusal') {
    return 'AI provider refused to answer this prompt.';
  }

  if (stopReason) {
    return `AI provider returned no text (stop_reason: ${stopReason}).`;
  }

  return 'AI provider returned an empty response.';
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

  let text = extractText(response.json);
  const toolCalls = extractToolCalls(response.json);

  // Tool-call turns legitimately carry no visible text
  if (!text && !toolCalls.length) {
    const blocks = Array.isArray(response.json?.content)
      ? response.json.content
      : [];
    const error: Error & { result?: unknown } = new Error(
      formatEmptyResponseError(response.json, input.runtime?.maxTokens),
    );

    error.result = {
      stopReason: response.json?.stop_reason ?? null,
      usage: response.json?.usage ?? null,
      contentBlocks: blocks.map((part: any) => part?.type),
      maxTokens: input.runtime?.maxTokens,
      sentMessages: input.messages.map((message) => ({
        role: message.role,
        chars: String(message.content ?? '').length,
      })),
      responseFormat: input.responseFormat ?? null,
      toolCount: input.tools?.length ?? 0,
    };

    throw error;
  }

  // The "{" prefill is not echoed back, so restore it for the parser.
  // (Prefill is skipped when tools are present.)
  if (
    input.responseFormat === 'json' &&
    !input.tools?.length &&
    text &&
    !text.startsWith('{')
  ) {
    text = `{${text}`;
  }

  return {
    text,
    ...(toolCalls.length ? { toolCalls } : {}),
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
