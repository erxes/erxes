import { TAiActionExecutionResult, TAiAgentActionConfig } from './contract';

const stripCodeFence = (value: string) => {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
};

const parseJsonObject = (value: string) => {
  const cleaned = stripCodeFence(value);

  try {
    return JSON.parse(cleaned);
  } catch (_error) {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);

    if (!objectMatch) {
      throw new Error('AI classification response is not valid JSON.');
    }

    return JSON.parse(objectMatch[0]);
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
    const cleaned = stripCodeFence(text).replace(/^"|"$/g, '').trim();
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
