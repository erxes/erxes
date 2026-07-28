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

// Models sometimes answer "not found" as a literal string instead of JSON null.
const PSEUDO_NULL_VALUES = new Set([
  'null',
  'undefined',
  'none',
  'n/a',
  'na',
  '-',
  '',
]);

const normalizeAiAttributeValue = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  return PSEUDO_NULL_VALUES.has(trimmed.toLowerCase()) ? null : trimmed;
};

const isEmptyAiAttributeValue = (value: unknown) =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && !value.trim()) ||
  (Array.isArray(value) && !value.length);

export const isAiClassificationResultEmpty = (
  result: TAiActionExecutionResult,
): boolean =>
  result.type === 'classification' &&
  Object.values(result.attributes).every(isEmptyAiAttributeValue);

const buildCaptureAttributes = (
  captureFields: { fieldName: string }[],
  rawAttributes: unknown,
) => {
  const source =
    rawAttributes &&
    typeof rawAttributes === 'object' &&
    !Array.isArray(rawAttributes)
      ? (rawAttributes as Record<string, unknown>)
      : {};

  return Object.fromEntries(
    captureFields.map(({ fieldName }) => [
      fieldName,
      normalizeAiAttributeValue(source[fieldName] ?? null),
    ]),
  );
};

const parseGenerateTextWithCapture = ({
  text,
  captureFields,
  fallbackText,
  usage,
}: {
  text: string;
  captureFields: { fieldName: string }[];
  fallbackText?: string;
  usage?: TAiActionExecutionResult['usage'];
}): TAiActionExecutionResult => {
  let parsed: unknown = null;

  try {
    parsed = parseJsonObject(text);
  } catch (_error) {
    parsed = null;
  }

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const parsedRecord = parsed as Record<string, unknown>;
    const attributes = buildCaptureAttributes(
      captureFields,
      parsedRecord.attributes,
    );

    if (typeof parsedRecord.reply === 'string') {
      return {
        type: 'generateText',
        text: parsedRecord.reply.trim(),
        attributes,
        usage,
      };
    }

    // JSON came back without a usable reply — salvage the attributes but
    // never leak the raw JSON into the conversation.
    return {
      type: 'generateText',
      text: (fallbackText || '').trim(),
      attributes,
      usage,
    };
  }

  const emptyAttributes = buildCaptureAttributes(captureFields, null);
  const cleaned = stripCodeFence(text);

  // Looks like broken JSON: sending it would show garbage to the customer.
  if (cleaned.startsWith('{')) {
    return {
      type: 'generateText',
      text: (fallbackText || '').trim(),
      attributes: emptyAttributes,
      usage,
    };
  }

  return {
    type: 'generateText',
    text: text.trim(),
    attributes: emptyAttributes,
    usage,
  };
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
    const captureFields = actionConfig.captureFields || [];

    if (!captureFields.length) {
      return {
        type: 'generateText',
        text: text.trim(),
        usage,
      };
    }

    return parseGenerateTextWithCapture({
      text,
      captureFields,
      fallbackText: actionConfig.fallbackText,
      usage,
    });
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
      normalizeAiAttributeValue(
        (parsed as Record<string, unknown>)[fieldName] ?? null,
      ),
    ]),
  );

  return {
    type: 'classification',
    attributes,
    usage,
  };
};
