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

const buildAutomationSystemInstruction = (actionConfig: TAiAgentActionConfig) => {
  if (actionConfig.goalType === 'generateText') {
    return [
      'You are an automation content generator.',
      'Your job is to produce the exact final artifact requested by the instruction.',
      'You are not in a live conversation unless the instruction explicitly asks for a conversational reply.',
      'Do not ask follow-up questions, do not simulate back-and-forth, and do not invent missing facts.',
      'Use only the provided instruction, source data, memory, and context documents.',
      'If information is missing, stay generic rather than fabricating details.',
      'Return only the final deliverable text with no preamble, no explanations, and no markdown code fences.',
      'If the instruction asks for an email template, return a ready-to-use email body unless the instruction explicitly asks for a subject line or another structure.',
      'Do not prepend labels such as "Subject:", "Body:", "Reply:", or "Here is the template:" unless explicitly requested.',
      'Match the language requested by the instruction or clearly implied by the source data.',
    ].join('\n');
  }

  if (actionConfig.goalType === 'splitTopic') {
    return [
      'You are an automation routing engine.',
      'Your job is to choose exactly one allowed topic identifier.',
      'Return only the topic id.',
      'Do not explain your choice.',
      'Do not return JSON, markdown, labels, or extra punctuation.',
      'If none is a perfect match, return the closest valid topic id from the allowed list.',
    ].join('\n');
  }

  return [
    'You are an automation classification engine.',
    'Your job is to extract structured values from the provided source data.',
    'Return only a valid JSON object.',
    'Use exactly the requested keys and do not add any extra keys.',
    'If a value is missing, ambiguous, or unsupported by the source data, return null for that field.',
    'Do not wrap the JSON in markdown code fences.',
  ].join('\n');
};

const buildUserPrompt = (
  actionConfig: TAiAgentActionConfig,
  inputText: string,
) => {
  if (actionConfig.goalType === 'generateText') {
    return [
      'Task instruction:',
      actionConfig.prompt.trim(),
      '',
      'Source data:',
      inputText,
      '',
      'Return only the final deliverable text.',
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
  const automationSystemInstruction = buildAutomationSystemInstruction(
    actionConfig,
  );

  const systemMessages: TAiBridgeMessage[] = [];

  if (automationSystemInstruction) {
    systemMessages.push({
      role: 'system',
      content: automationSystemInstruction,
    });
  }

  const systemContent = [systemPrompt?.trim() || '', contextSection ? `Context documents:\n\n${contextSection}` : '']
    .filter(Boolean)
    .join('\n\n');

  systemMessages.push({
    role: 'system',
    content:
      systemContent ||
      'You are an automation AI bridge. Follow the requested output format exactly.',
  });

  return [
    ...systemMessages,
    {
      role: 'user',
      content: [memorySection, buildUserPrompt(actionConfig, inputText)]
        .filter(Boolean)
        .join('\n\n'),
    },
  ];
};
