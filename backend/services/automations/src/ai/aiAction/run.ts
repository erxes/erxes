import { TAiContext } from 'erxes-api-shared/core-modules';
import { TAiAgentInput, loadAiAgentContextFiles } from '../aiAgent';
import { invokeAiProvider, TAiBridgeToolDefinition } from '../bridge';
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
import { runAiToolLoop, TAiToolRuntime } from './tools';

const resolveNextActionId = (
  actionConfig: TAiAgentActionConfig,
  result: TAiActionExecutionResult,
) => {
  // A generateText handoff routes exactly like a matched topic
  if (result.type === 'generateText' && result.handoff?.toolId) {
    const handoffToolId = result.handoff.toolId;

    return actionConfig.optionalConnects.find(
      ({ optionalConnectId }) => optionalConnectId === handoffToolId,
    )?.actionId;
  }

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
  tools,
}: {
  agent: TAiAgentInput;
  messages: ReturnType<typeof buildAiActionMessages>;
  subdomain: string;
  actionConfig: TAiAgentActionConfig;
  tools?: TAiBridgeToolDefinition[];
}) => {
  const responseFormat = getAiResponseFormat(actionConfig);

  if (actionConfig.goalType !== 'generateText') {
    return invokeAiProvider(agent, messages, subdomain, { responseFormat });
  }

  const providerPromise = invokeAiProvider(agent, messages, subdomain, {
    responseFormat,
    tools,
  }).catch((error) => {
    if (isAiProviderTimeoutError(error)) {
      const fallbackResponse = createAiProviderFallbackResponse(actionConfig);

      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    throw error;
  });
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
  tools,
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
  // Runtime-wired tools for generateText (built by the action executor)
  tools?: TAiToolRuntime[];
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

  const hasTools =
    parsedActionConfig.goalType === 'generateText' && !!tools?.length;

  let providerResponse;
  let handoff;
  let toolCallTrace;

  if (hasTools) {
    ({ providerResponse, handoff, toolCallTrace } = await runAiToolLoop({
      messages: [
        ...messages,
        // Models reliably use tools only when told to prefer them over
        // improvising — but conditional handoffs must not fire early, and no
        // action outcome may be faked
        {
          role: 'system',
          content:
            'Tools are available for this reply. A tool description states WHEN to call it — call a tool only when that condition is fully satisfied AND you can truthfully fill every required parameter from the conversation or memory. If anything is missing, do not call the tool; reply to the user to gather it. When the condition does hold, call the tool instead of answering yourself. Never claim an action (order, ticket, escalation, lookup) happened unless the corresponding tool was actually called.',
        },
      ],
      tools: tools || [],
      invoke: (loopMessages, definitions) =>
        invokeAiProviderWithRealtimeFallback({
          agent,
          messages: loopMessages,
          subdomain,
          actionConfig: parsedActionConfig,
          tools: definitions,
        }),
    }));
  } else {
    providerResponse = await invokeAiProviderWithRealtimeFallback({
      agent,
      messages,
      subdomain,
      actionConfig: parsedActionConfig,
    });
  }

  // A handoff turn may carry no final text — skip parsing, the routed flow
  // owns what happens next.
  const result: TAiActionExecutionResult = handoff
    ? {
        type: 'generateText',
        text: providerResponse.text || '',
        usage: providerResponse.usage,
      }
    : parseAiActionResult({
        actionConfig: parsedActionConfig,
        text: providerResponse.text,
        usage: providerResponse.usage,
      });

  if (result.type === 'generateText') {
    if (handoff) {
      result.handoff = handoff;
      result.args = handoff.args;

      // A handoff turn produces no parsed capture output; the handoff
      // arguments carry those values instead, so downstream
      // {{ actions.<id>.attributes.* }} refs and memory writes keep working
      const captureNames =
        parsedActionConfig.goalType === 'generateText'
          ? (parsedActionConfig.captureFields || []).map(
              ({ fieldName }) => fieldName,
            )
          : [];
      const capturedFromArgs = Object.fromEntries(
        captureNames
          .filter((name) => handoff.args[name] !== undefined)
          .map((name) => [name, handoff.args[name]]),
      );

      if (Object.keys(capturedFromArgs).length) {
        result.attributes = capturedFromArgs;
      }
    }

    if (toolCallTrace?.length) {
      result.toolCalls = toolCallTrace;
    }

    // Debug/observability: proves whether tools reached the provider
    if (hasTools) {
      result.toolsOffered = (tools || []).map(
        ({ definition, kind }) => `${definition.name} (${kind})`,
      );
    }
  }

  return {
    result,
    nextActionId: resolveNextActionId(parsedActionConfig, result),
    conversationState: stateBeforeReply || conversationState || null,
  };
};
