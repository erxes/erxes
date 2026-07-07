import { TAiContext } from 'erxes-api-shared/core-modules';
import { TAiAgentInput, loadAiAgentContextFiles } from '../aiAgent';
import { invokeAiProvider } from '../bridge';
import { retrieveAiAgentKnowledgeContextFiles } from '../knowledge';
import {
  buildAiConversationStateUpdateMessages,
  mergeAiConversationStateIntoMemory,
  parseAiConversationStateUpdate,
  TAiConversationState,
} from '../memory';
import type { IModels } from '../../connectionResolver';
import { buildAiActionMessages } from './messages';
import {
  parseAiAgentActionConfig,
  TAiActionExecutionResult,
  TAiAgentActionConfig,
} from './contract';
import { parseAiActionResult } from './parser';

const resolveNextActionId = (
  actionConfig: TAiAgentActionConfig,
  result: TAiActionExecutionResult,
) => {
  if (result.type !== 'splitTopic' || !result.topicId) {
    return undefined;
  }

  return actionConfig.optionalConnects.find(
    ({ optionalConnectId }) => optionalConnectId === result.topicId,
  )?.actionId;
};

const createAiProviderTimeoutFallback = (actionConfig: TAiAgentActionConfig) =>
  actionConfig.goalType === 'generateText'
    ? actionConfig.fallbackText?.trim()
    : undefined;

const isAiProviderTimeoutError = (error: unknown) =>
  error instanceof Error &&
  (error.name === 'AbortError' ||
    error.message.toLowerCase().includes('timed out'));

const createAiProviderFallbackResponse = (
  actionConfig: TAiAgentActionConfig,
) => {
  const fallbackText = createAiProviderTimeoutFallback(actionConfig);

  if (!fallbackText) {
    return undefined;
  }

  return {
    text: fallbackText,
    raw: { fallback: 'provider-timeout' },
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    },
  };
};

const getAiResponseFormat = (
  actionConfig: TAiAgentActionConfig,
): 'json' | undefined => {
  if (actionConfig.goalType === 'classification') {
    return 'json';
  }

  if (
    actionConfig.goalType === 'generateText' &&
    (actionConfig.captureFields || []).length
  ) {
    return 'json';
  }

  return undefined;
};

const invokeAiProviderWithRealtimeFallback = async ({
  agent,
  messages,
  subdomain,
  actionConfig,
}: {
  agent: TAiAgentInput;
  messages: ReturnType<typeof buildAiActionMessages>;
  subdomain: string;
  actionConfig: TAiAgentActionConfig;
}) => {
  const responseFormat = getAiResponseFormat(actionConfig);

  if (actionConfig.goalType !== 'generateText') {
    return invokeAiProvider(agent, messages, subdomain, { responseFormat });
  }

  const providerPromise = invokeAiProvider(agent, messages, subdomain, {
    responseFormat,
  }).catch(
    (error) => {
      if (isAiProviderTimeoutError(error)) {
        const fallbackResponse = createAiProviderFallbackResponse(actionConfig);

        if (fallbackResponse) {
          return fallbackResponse;
        }
      }

      throw error;
    },
  );
  const timeoutMs = agent.runtime.timeoutMs || 15000;
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      providerPromise,
      new Promise<Awaited<typeof providerPromise>>((resolve) => {
        timeoutId = setTimeout(() => {
          const fallbackResponse =
            createAiProviderFallbackResponse(actionConfig);

          if (fallbackResponse) {
            resolve(fallbackResponse);
          }
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const updateConversationStateWithAi = async ({
  agent,
  subdomain,
  currentState,
  inputData,
  aiContext,
  contextFiles,
}: {
  agent: TAiAgentInput;
  subdomain: string;
  currentState?: TAiConversationState | null;
  inputData: unknown;
  aiContext?: TAiContext | null;
  contextFiles: Parameters<
    typeof buildAiConversationStateUpdateMessages
  >[0]['contextFiles'];
}) => {
  if (!currentState) {
    return null;
  }

  const messages = buildAiConversationStateUpdateMessages({
    currentState,
    inputData,
    aiContext,
    contextFiles,
  });

  if (!messages) {
    return currentState;
  }

  try {
    const response = await invokeAiProvider(
      {
        ...agent,
        runtime: {
          ...agent.runtime,
          maxTokens: Math.max(agent.runtime.maxTokens || 0, 400),
        },
      },
      messages,
      subdomain,
    );

    return parseAiConversationStateUpdate({
      text: response.text,
      fallbackState: currentState,
    });
  } catch (_error) {
    return currentState;
  }
};

export const runAiAction = async ({
  subdomain,
  agent,
  agentId,
  models,
  actionConfig,
  inputData,
  aiContext,
  memory,
  conversationState,
}: {
  subdomain: string;
  agent: TAiAgentInput;
  agentId?: string;
  models?: IModels;
  actionConfig: unknown;
  inputData: unknown;
  aiContext?: TAiContext | null;
  memory?: Record<string, unknown>;
  conversationState?: TAiConversationState | null;
}) => {
  const parsedActionConfig = parseAiAgentActionConfig(actionConfig);
  const retrievedContext =
    models && agentId
      ? await retrieveAiAgentKnowledgeContextFiles({
          subdomain,
          models,
          agentId,
          agent,
          actionConfig: parsedActionConfig,
          inputData,
          aiContext,
        })
      : [];

  const uploadedContext = await loadAiAgentContextFiles(
    subdomain,
    agent.context.files,
  );
  const loadedContext = {
    files: [...retrievedContext, ...uploadedContext.files],
    totalBytes:
      uploadedContext.totalBytes +
      retrievedContext.reduce((sum, file) => sum + file.bytes, 0),
    errors: uploadedContext.errors,
    warnings: uploadedContext.warnings,
  };

  if (loadedContext.errors.length) {
    throw new Error(loadedContext.errors.join('\n'));
  }

  const stateBeforeReply = await updateConversationStateWithAi({
    agent,
    subdomain,
    currentState: conversationState || undefined,
    inputData,
    aiContext,
    contextFiles: loadedContext.files,
  });
  const memoryWithConversationState = mergeAiConversationStateIntoMemory({
    memory,
    conversationState: stateBeforeReply,
  });

  const messages = buildAiActionMessages({
    systemPrompt: agent.context.systemPrompt,
    files: loadedContext.files,
    actionConfig: parsedActionConfig,
    inputData,
    aiContext,
    memory: memoryWithConversationState,
  });

  const providerResponse = await invokeAiProviderWithRealtimeFallback({
    agent,
    messages,
    subdomain,
    actionConfig: parsedActionConfig,
  });

  const result = parseAiActionResult({
    actionConfig: parsedActionConfig,
    text: providerResponse.text,
    usage: providerResponse.usage,
  });

  return {
    result,
    nextActionId: resolveNextActionId(parsedActionConfig, result),
    conversationState: stateBeforeReply || conversationState || null,
  };
};
