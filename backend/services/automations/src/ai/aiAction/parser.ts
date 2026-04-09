import { TAiActionExecutionResult, TAiAgentActionConfig } from './contract';

const trimLeadingWhitespace = (value: string) => {
  let start = 0;

  while (start < value.length && /\s/.test(value[start])) {
    start += 1;
  }

  return value.slice(start);
};

const trimTrailingWhitespace = (value: string) => {
  let end = value.length;

  while (end > 0 && /\s/.test(value[end - 1])) {
    end -= 1;
  }

  return value.slice(0, end);
};

const stripCodeFence = (value: string) => {
  let cleaned = value.trim();

  if (cleaned.startsWith('```json')) {
    cleaned = trimLeadingWhitespace(cleaned.slice('```json'.length));
  } else if (cleaned.startsWith('```')) {
    cleaned = trimLeadingWhitespace(cleaned.slice('```'.length));
  }

  const trimmedEnd = trimTrailingWhitespace(cleaned);

  if (trimmedEnd.endsWith('```')) {
    cleaned = trimTrailingWhitespace(trimmedEnd.slice(0, -3));
  } else {
    cleaned = trimmedEnd;
  }

  return cleaned.trim();
};

const extractJsonObject = (value: string) => {
  const objectStart = value.indexOf('{');
  const objectEnd = value.lastIndexOf('}');

  if (objectStart === -1 || objectEnd === -1 || objectEnd < objectStart) {
    return null;
  }

  return value.slice(objectStart, objectEnd + 1);
};

const stripWrappingQuotes = (value: string) => {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  return value;
};

const parseJsonObject = (value: string) => {
  const cleaned = stripCodeFence(value);

  try {
    return JSON.parse(cleaned);
  } catch (_error) {
    const objectMatch = extractJsonObject(cleaned);

    if (!objectMatch) {
      throw new Error('AI classification response is not valid JSON.');
    }

    return JSON.parse(objectMatch);
  }
};

export const parseAiActionResult = ({
  actionConfig,
  text,
  usage,
}: {
  actionConfig: TAiAgentActionConfig;
  text: string;
  usage?: TAiActionExecutionResult['usage'];
}): TAiActionExecutionResult => {
  if (actionConfig.goalType === 'generateText') {
    return {
      type: 'generateText',
      text: text.trim(),
      usage,
    };
  }

  if (actionConfig.goalType === 'splitTopic') {
    const cleaned = stripWrappingQuotes(stripCodeFence(text)).trim();
    const matchedTopic = actionConfig.topics.find(({ id }) => id === cleaned);

    return {
      type: 'splitTopic',
      topicId: matchedTopic?.id || null,
      matched: !!matchedTopic,
      usage,
    };
  }

  const parsed = parseJsonObject(text);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('AI classification response must be a JSON object.');
  }

  const attributes = Object.fromEntries(
    actionConfig.objectFields.map(({ fieldName }) => [
      fieldName,
      (parsed as Record<string, unknown>)[fieldName] ?? null,
    ]),
  );

  return {
    type: 'classification',
    attributes,
    usage,
  };
};
