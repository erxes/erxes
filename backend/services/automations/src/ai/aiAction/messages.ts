import { TAiContext } from 'erxes-api-shared/core-modules';
import { TAiAgentLoadedContextFile } from '../aiAgent/context';
import { TAiBridgeMessage } from '../bridge';
import { TAiAgentActionConfig } from './contract';
import { buildAiInputFromContext } from './context';

const buildContextSection = (files: TAiAgentLoadedContextFile[]) => {
  if (!files.length) {
    return '';
  }

  return files.map(({ name, content }) => `# ${name}\n${content}`).join('\n\n');
};

const buildMemorySection = (memory?: Record<string, unknown>) => {
  if (!memory || !Object.keys(memory).length) {
    return '';
  }

  return `Saved memory:\n${JSON.stringify(memory, null, 2)}`;
};

const buildUserPrompt = (
  actionConfig: TAiAgentActionConfig,
  inputText: string,
) => {
  if (actionConfig.goalType === 'generateText') {
    return [
      actionConfig.prompt.trim(),
      '',
      'User input:',
      inputText,
      '',
      'Return only the final response text.',
    ].join('\n');
  }

  if (actionConfig.goalType === 'splitTopic') {
    const topics = actionConfig.topics
      .map(
        (topic, index) =>
          `${index + 1}. id="${topic.id}" name="${topic.topicName}" prompt="${
            topic.prompt || ''
          }"`,
      )
      .join('\n');

    return [
      'You are an automation routing engine.',
      'Choose exactly one topic id from the allowed list.',
      'Return only the topic id.',
      'Do not explain.',
      '',
      'Allowed topics:',
      topics,
      '',
      'User input:',
      inputText,
    ].join('\n');
  }

  const fields = actionConfig.objectFields
    .map(
      (field, index) =>
        `${index + 1}. key="${field.fieldName}" type="${
          field.dataType
        }" validation="${field.validation || ''}" prompt="${
          field.prompt || ''
        }"`,
    )
    .join('\n');

  const responseShape = actionConfig.objectFields
    .map((field) => `  "${field.fieldName}": null`)
    .join(',\n');

  return [
    'You are an automation classification engine.',
    'Extract the requested fields from the user input.',
    'Return valid JSON only.',
    'If a value is missing or uncertain, return null.',
    'Do not add extra keys.',
    '',
    'Fields:',
    fields,
    '',
    'Response format:',
    '{',
    responseShape,
    '}',
    '',
    'User input:',
    inputText,
  ].join('\n');
};

export const buildAiActionMessages = ({
  systemPrompt,
  files,
  actionConfig,
  inputData,
  aiContext,
  memory,
}: {
  systemPrompt?: string;
  files: TAiAgentLoadedContextFile[];
  actionConfig: TAiAgentActionConfig;
  inputData: unknown;
  aiContext?: TAiContext | null;
  memory?: Record<string, unknown>;
}): TAiBridgeMessage[] => {
  const inputText = buildAiInputFromContext({ inputData, aiContext });
  const contextSection = buildContextSection(files);
  const memorySection = buildMemorySection(memory);

  const systemContent = [
    systemPrompt?.trim() || '',
    contextSection ? `Context documents:\n\n${contextSection}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return [
    {
      role: 'system',
      content:
        systemContent ||
        'You are an automation AI bridge. Follow the requested output format exactly.',
    },
    {
      role: 'user',
      content: [memorySection, buildUserPrompt(actionConfig, inputText)]
        .filter(Boolean)
        .join('\n\n'),
    },
  ];
};
