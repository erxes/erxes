import { TAiContext } from 'erxes-api-shared/core-modules';

// The reply sees a wider window than the retrieval query: more history helps
// the model, but only dilutes the search terms.
export const AI_PROMPT_HISTORY_LIMIT = 12;
export const AI_SEARCH_HISTORY_LIMIT = 5;

export const stringifyAiContextValue = (value: unknown) => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value == null) {
    return '';
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch (_error) {
    return String(value);
  }
};

export const getLatestUserText = ({
  inputData,
  aiContext,
}: {
  inputData: unknown;
  aiContext?: TAiContext | null;
}) =>
  stringifyAiContextValue(aiContext?.input?.text) ||
  stringifyAiContextValue(inputData);

export const buildAiHistorySection = ({
  aiContext,
  limit,
  heading,
}: {
  aiContext?: TAiContext | null;
  limit: number;
  heading: string;
}) => {
  const items = (aiContext?.history || [])
    .filter((item) => item.text?.trim())
    .slice(-limit)
    .map((item) => `${item.role || item.type || 'context'}: ${item.text}`);

  return items.length ? [heading, ...items].join('\n') : '';
};

const buildFactsSection = (aiContext?: TAiContext | null) => {
  if (!aiContext?.facts || !Object.keys(aiContext.facts).length) {
    return '';
  }

  return `Known facts:\n${JSON.stringify(aiContext.facts, null, 2)}`;
};

export const buildAiInputFromContext = ({
  inputData,
  aiContext,
  historyLimit = AI_PROMPT_HISTORY_LIMIT,
}: {
  inputData: unknown;
  aiContext?: TAiContext | null;
  historyLimit?: number;
}) => {
  const explicitInput = stringifyAiContextValue(inputData);
  const latestUserMessage = stringifyAiContextValue(aiContext?.input?.text);
  const actionInput =
    explicitInput && explicitInput !== latestUserMessage ? explicitInput : '';

  // A model answers whatever it read last, so history goes first and the
  // message being replied to closes the block.
  return [
    buildAiHistorySection({
      aiContext,
      limit: historyLimit,
      heading: 'Earlier in this conversation (background only):',
    }),
    buildFactsSection(aiContext),
    actionInput ? `Action input:\n${actionInput}` : '',
    latestUserMessage ? `Current message to answer:\n${latestUserMessage}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
};
