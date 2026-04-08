import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';

export type TAiAgentRuntimeSummarySource = {
  name?: string;
  connection?: {
    provider?: string;
    model?: string;
  };
  runtime?: {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  };
  context?: {
    systemPrompt?: string;
    files?: Array<{
      id?: string;
      name?: string;
      size?: number;
      type?: string;
      key?: string;
      uploadedAt?: string;
    }>;
  };
};

export type TAiAgentRuntimeSummary = {
  maxTokens: number;
  timeoutMs: number;
  temperature: number;
  model: string;
  systemPromptChars: number;
  contextFileCount: number;
  contextBytes: number;
  goalPromptChars: number;
  goalItemCount: number;
  customInputChars: number;
  inputMode: 'focused' | 'full-trigger' | 'previous-action' | 'custom';
  notes: Array<{
    variant: 'default' | 'warning';
    text: string;
  }>;
};

const DEFAULT_RUNTIME = {
  temperature: 0.2,
  maxTokens: 500,
  timeoutMs: 15000,
} as const;

const sumStringLength = (...values: Array<string | undefined>) =>
  values.reduce((total, value) => total + (value?.trim().length || 0), 0);

const getGoalPromptStats = (config?: Partial<TAiAgentConfigForm>) => {
  if (!config?.goalType) {
    return { chars: 0, itemCount: 0 };
  }

  if (config.goalType === 'generateText') {
    return {
      chars: config.prompt?.trim().length || 0,
      itemCount: config.prompt?.trim() ? 1 : 0,
    };
  }

  if (config.goalType === 'splitTopic') {
    const topics = config.topics || [];

    return {
      chars: topics.reduce(
        (total, topic) =>
          total + sumStringLength(topic.topicName, topic.prompt, topic.id),
        0,
      ),
      itemCount: topics.length,
    };
  }

  const objectFields = config.objectFields || [];

  return {
    chars: objectFields.reduce(
      (total, field) =>
        total +
        sumStringLength(
          field.fieldName,
          field.prompt,
          field.validation,
          field.dataType,
        ),
      0,
    ),
    itemCount: objectFields.length,
  };
};

const getInputMode = (
  config?: Partial<TAiAgentConfigForm>,
): TAiAgentRuntimeSummary['inputMode'] => {
  if (!config?.inputMapping) {
    return 'full-trigger';
  }

  if (config.inputMapping.source === 'custom') {
    return 'custom';
  }

  if (config.inputMapping.source === 'previousAction') {
    return 'previous-action';
  }

  return config.inputMapping.path?.trim() ? 'focused' : 'full-trigger';
};

export const formatAiAgentByteSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${bytes} B`;
};

export const buildAiAgentRuntimeSummary = ({
  agent,
  actionConfig,
}: {
  agent?: TAiAgentRuntimeSummarySource | null;
  actionConfig?: Partial<TAiAgentConfigForm>;
}): TAiAgentRuntimeSummary => {
  const files = agent?.context?.files || [];
  const contextBytes = files.reduce((total, file) => {
    return total + (typeof file.size === 'number' ? file.size : 0);
  }, 0);
  const systemPromptChars = agent?.context?.systemPrompt?.trim().length || 0;
  const { chars: goalPromptChars, itemCount: goalItemCount } =
    getGoalPromptStats(actionConfig);
  const inputMode = getInputMode(actionConfig);
  const customInputChars =
    actionConfig?.inputMapping?.source === 'custom'
      ? actionConfig?.inputMapping?.customValue?.trim().length || 0
      : 0;
  const model = agent?.connection?.model || '';
  const normalizedSystemPrompt =
    agent?.context?.systemPrompt?.trim().toLowerCase() || '';

  const maxTokens = agent?.runtime?.maxTokens ?? DEFAULT_RUNTIME.maxTokens;
  const timeoutMs = agent?.runtime?.timeoutMs ?? DEFAULT_RUNTIME.timeoutMs;
  const temperature =
    agent?.runtime?.temperature ?? DEFAULT_RUNTIME.temperature;

  const notes: TAiAgentRuntimeSummary['notes'] = [];

  if (inputMode === 'full-trigger') {
    notes.push({
      variant: 'warning',
      text: 'This action will send the full trigger payload to the AI agent. Narrow the input path if you only need a few fields.',
    });
  }

  if (inputMode === 'previous-action') {
    notes.push({
      variant: 'warning',
      text: 'This action reads the whole previous action result. Large upstream payloads can slow the model call.',
    });
  }

  if (model.trim().toLowerCase().startsWith('gpt-5') && maxTokens <= 250) {
    notes.push({
      variant: 'warning',
      text: 'GPT-5 models may spend part of the completion budget on internal reasoning. Very low max token caps can end with no visible text even when the prompt is short.',
    });
  }

  if (
    actionConfig?.goalType === 'generateText' &&
    ['messenger', 'chat assistant', 'follow-up question', 'one question at a time']
      .some((keyword) => normalizedSystemPrompt.includes(keyword))
  ) {
    notes.push({
      variant: 'warning',
      text: 'This agent system prompt looks chat-oriented. For email or template generation, use an artifact-oriented prompt instead of a live support assistant prompt.',
    });
  }

  if (actionConfig?.goalType === 'generateText' && maxTokens > 300) {
    notes.push({
      variant: 'default',
      text: 'Short email or reply generation usually stays stable around 150-300 max tokens.',
    });
  }

  if (
    timeoutMs <= 15000 &&
    (contextBytes >= 25_000 ||
      systemPromptChars >= 1_000 ||
      goalPromptChars >= 600 ||
      inputMode !== 'focused')
  ) {
    notes.push({
      variant: 'warning',
      text: 'This setup may hit the current timeout on slower providers. Reduce prompt/context size or increase the timeout.',
    });
  }

  if (!notes.length) {
    notes.push({
      variant: 'default',
      text: 'Focused input paths, moderate token caps, and shorter prompts usually produce the most reliable automation runs.',
    });
  }

  return {
    maxTokens,
    timeoutMs,
    temperature,
    model,
    systemPromptChars,
    contextFileCount: files.length,
    contextBytes,
    goalPromptChars,
    goalItemCount,
    customInputChars,
    inputMode,
    notes,
  };
};
