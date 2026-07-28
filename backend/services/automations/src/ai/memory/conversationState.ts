import {
  IAutomationExecutionDocument,
  TAiContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '../../connectionResolver';
import { TAiAgentLoadedContextFile } from '../aiAgent/context';
import { TAiAgentActionConfig } from '../aiAction/contract';
import { stringifyAiContextValue } from '../aiAction/context';
import type { TAiBridgeMessage } from '../bridge';
import { resolveAiMemoryScopeKey } from './store';

export type TAiConversationState = {
  slots: Record<string, unknown>;
  lastAskedField?: string;
  updatedAt?: string;
};

type TConversationStateParams = {
  models: IModels;
  execution: IAutomationExecutionDocument;
  actionConfig: TAiAgentActionConfig;
  aiContext?: TAiContext | null;
};

type TBuildConversationStateUpdateMessagesParams = {
  currentState?: TAiConversationState | null;
  inputData: unknown;
  aiContext?: TAiContext | null;
  contextFiles: TAiAgentLoadedContextFile[];
};

const CONVERSATION_STATE_NAMESPACE = 'ai-agent:conversation-state';
const CONVERSATION_STATE_DATA_KEY = 'conversationState';
const DEFAULT_CONVERSATION_STATE_TTL_MINUTES = 1440;
const MAX_STATE_CONTEXT_BYTES = 6000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isConversationStateEnabled = (actionConfig: TAiAgentActionConfig) =>
  actionConfig.goalType === 'generateText' &&
  !!actionConfig.memory?.read?.enabled;

const parseStoredConversationState = (value: unknown): TAiConversationState => {
  if (!isRecord(value)) {
    return { slots: {} };
  }

  const slots = isRecord(value.slots) ? value.slots : {};
  const lastAskedField =
    typeof value.lastAskedField === 'string' && value.lastAskedField.trim()
      ? value.lastAskedField.trim()
      : undefined;
  const updatedAt =
    typeof value.updatedAt === 'string' && value.updatedAt.trim()
      ? value.updatedAt.trim()
      : undefined;

  return {
    slots,
    ...(lastAskedField ? { lastAskedField } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  };
};

const hasConversationStateValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  if (isRecord(value)) {
    return Object.keys(value).length > 0;
  }

  return true;
};

const compactSlots = (slots: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(slots).filter(([, value]) =>
      hasConversationStateValue(value),
    ),
  );

const normalizeConversationState = (state?: unknown): TAiConversationState => {
  const parsedState = parseStoredConversationState(state);

  return {
    slots: compactSlots(parsedState.slots),
    ...(parsedState.lastAskedField
      ? { lastAskedField: parsedState.lastAskedField }
      : {}),
    ...(parsedState.updatedAt ? { updatedAt: parsedState.updatedAt } : {}),
  };
};

const getLatestUserText = ({
  inputData,
  aiContext,
}: {
  inputData: unknown;
  aiContext?: TAiContext | null;
}) =>
  stringifyAiContextValue(aiContext?.input?.text) ||
  stringifyAiContextValue(inputData);

const buildHistorySection = (aiContext?: TAiContext | null) => {
  const history = (aiContext?.history || [])
    .filter((item) => item.text?.trim())
    .slice(-12)
    .map((item) => `${item.role || item.type || 'context'}: ${item.text}`)
    .join('\n');

  return history ? `Recent conversation history:\n${history}` : '';
};

const buildContextSection = (contextFiles: TAiAgentLoadedContextFile[]) => {
  let remainingBytes = MAX_STATE_CONTEXT_BYTES;
  const sections: string[] = [];

  for (const file of contextFiles) {
    if (remainingBytes <= 0) {
      break;
    }

    const content = file.content.slice(0, remainingBytes);
    remainingBytes -= Buffer.byteLength(content, 'utf8');
    sections.push(`# ${file.name}\n${content}`);
  }

  return sections.length
    ? `Context documents for entity/fact normalization:\n\n${sections.join(
        '\n\n',
      )}`
    : '';
};

const stripJsonFence = (value: string) =>
  value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

export const parseAiConversationStateUpdate = ({
  text,
  fallbackState,
}: {
  text: string;
  fallbackState?: TAiConversationState | null;
}) => {
  try {
    const parsed = JSON.parse(stripJsonFence(text));
    const normalized = normalizeConversationState(parsed);

    return {
      ...normalized,
      updatedAt: new Date().toISOString(),
    };
  } catch (_error) {
    return fallbackState || null;
  }
};

export const buildAiConversationStateUpdateMessages = ({
  currentState,
  inputData,
  aiContext,
  contextFiles,
}: TBuildConversationStateUpdateMessagesParams): TAiBridgeMessage[] | null => {
  if (!currentState) {
    return null;
  }

  const latestUserText = getLatestUserText({ inputData, aiContext });

  return [
    {
      role: 'system',
      content: [
        'You update persistent conversation state for an automation AI agent.',
        'Return only valid JSON. Do not return markdown, prose, or explanations.',
        'The JSON shape must be: {"slots": object, "lastAskedField": string|null}.',
        'State is generic. Do not assume a fixed business flow or fixed slot names.',
        'Preserve existing slots unless the latest user message clearly changes or removes them.',
        'Add or update only durable facts, choices, selected entities, user preferences, constraints, or identifiers that help the next reply avoid asking the same thing again.',
        'Do not store greetings, transient questions, assistant wording, unsupported guesses, or one-off conversational filler.',
        'If the latest user message is short or ambiguous, infer its meaning from the immediate recent conversation history.',
        'Reuse existing slot keys when possible. For new slots, use concise camelCase keys.',
        'Use context documents only to normalize referenced entities and explicit facts; do not invent user choices from context alone.',
        'Set lastAskedField to the generic slot key the assistant most recently asked the user to provide, if visible from history; otherwise keep the existing value or null.',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        'Current conversation state:',
        JSON.stringify(normalizeConversationState(currentState), null, 2),
        '',
        buildHistorySection(aiContext),
        latestUserText ? `Latest user message:\n${latestUserText}` : '',
        buildContextSection(contextFiles),
        '',
        'Return the complete next conversation state JSON now.',
      ]
        .filter(Boolean)
        .join('\n\n'),
    },
  ];
};

const getFilledFieldNames = (slots: Record<string, unknown>) =>
  Object.entries(slots)
    .filter(([, value]) => hasConversationStateValue(value))
    .map(([key]) => key);

export const loadAiConversationState = async ({
  models,
  execution,
  actionConfig,
  aiContext,
}: TConversationStateParams): Promise<TAiConversationState | null> => {
  if (!isConversationStateEnabled(actionConfig)) {
    return null;
  }

  const scopeKey = resolveAiMemoryScopeKey(execution, aiContext);

  if (!scopeKey) {
    return null;
  }

  const memory = await models.AutomationMemory.findOne({
    automationId: execution.automationId,
    namespace: CONVERSATION_STATE_NAMESPACE,
    scopeKey,
  }).lean();

  return normalizeConversationState(
    (memory?.data || {})[CONVERSATION_STATE_DATA_KEY],
  );
};

export const formatAiConversationStateForPrompt = (state?: unknown) => {
  const parsedState = normalizeConversationState(state);

  if (!Object.keys(parsedState.slots).length) {
    return '';
  }

  return [
    'Conversation state memory:',
    JSON.stringify(
      {
        slots: parsedState.slots,
        filledFields: getFilledFieldNames(parsedState.slots),
        lastAskedField: parsedState.lastAskedField || null,
      },
      null,
      2,
    ),
    '',
    'Conversation state rules:',
    '- Treat filled fields as already answered. Do not ask for them again unless the latest user message changes them.',
    '- If the latest user message is short, use conversation state and recent history to interpret it.',
    '- Answer the latest user question first, then ask only one next missing field if a follow-up is needed.',
  ].join('\n');
};

export const persistAiConversationState = async ({
  models,
  execution,
  actionConfig,
  aiContext,
  state,
}: TConversationStateParams & {
  state?: TAiConversationState | null;
}) => {
  if (!state || !isConversationStateEnabled(actionConfig)) {
    return null;
  }

  const scopeKey = resolveAiMemoryScopeKey(execution, aiContext);

  if (!scopeKey) {
    return null;
  }

  const expiresAt = new Date(
    Date.now() + DEFAULT_CONVERSATION_STATE_TTL_MINUTES * 60 * 1000,
  );

  await models.AutomationMemory.updateOne(
    {
      automationId: execution.automationId,
      namespace: CONVERSATION_STATE_NAMESPACE,
      scopeKey,
    },
    {
      $set: {
        data: {
          [CONVERSATION_STATE_DATA_KEY]: normalizeConversationState(state),
        },
        expiresAt,
      },
      $setOnInsert: {
        automationId: execution.automationId,
        namespace: CONVERSATION_STATE_NAMESPACE,
        scopeKey,
      },
    },
    { upsert: true },
  );

  return state;
};

export const mergeAiConversationStateIntoMemory = ({
  memory,
  conversationState,
}: {
  memory?: Record<string, unknown>;
  conversationState?: TAiConversationState | null;
}) => {
  if (!conversationState) {
    return memory;
  }

  return {
    ...(memory || {}),
    conversationState,
  };
};
