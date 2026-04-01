import { TAiContext } from 'erxes-api-shared/core-modules';

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

const buildHistorySection = (aiContext?: TAiContext | null) => {
  const items = (aiContext?.history || [])
    .filter((item) => item.text?.trim())
    .slice(-10)
    .map((item) => `${item.role || item.type || 'context'}: ${item.text}`);

  if (!items.length) {
    return '';
  }

  return ['Relevant history:', ...items].join('\n');
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
}: {
  inputData: unknown;
  aiContext?: TAiContext | null;
}) => {
  const explicitInput = stringifyAiContextValue(inputData);
  const currentInput =
    explicitInput || stringifyAiContextValue(aiContext?.input?.text);

  return [
    buildHistorySection(aiContext),
    buildFactsSection(aiContext),
    currentInput ? `Current input:\n${currentInput}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
};
