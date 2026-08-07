import { TAiContext } from 'erxes-api-shared/core-modules';
import {
  AI_AGENT_TOOL_LOOP_MIN_MAX_TOKENS,
  TAiAgentInput,
  loadAiAgentContextFiles,
} from '../aiAgent';
import {
  invokeAiProvider,
  TAiBridgeMessage,
  TAiBridgeToolDefinition,
} from '../bridge';
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
import { AI_KNOWLEDGE_TOOL_ID, AI_KNOWLEDGE_TOOL_NAME } from './knowledgeTool';
import { getLatestUserText } from './context';
import {
  AI_DISCLOSURE_BLOCKED_TEXT,
  AI_SELF_DISCLOSURE_REFUSAL_RULE,
  findAiReplyDisclosure,
  isAiSelfDisclosureProbe,
} from './disclosure';

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
    fallback: true as const,
    raw: { fallback: 'provider-timeout' },
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    },
  };
};

// Lookup and action tools need opposite instincts: search freely, act only on
// a fully satisfied condition.
const buildToolInstruction = (tools: TAiToolRuntime[]) => {
  const hasKnowledgeTool = tools.some(
    (tool) => tool.toolId === AI_KNOWLEDGE_TOOL_ID,
  );
  const hasActionTools = tools.some(
    (tool) => tool.toolId !== AI_KNOWLEDGE_TOOL_ID,
  );

  return [
    'Tools are available for this reply.',
    hasKnowledgeTool
      ? `A first knowledge search for this message has already run and its passages are in the context documents above. Answer from those when they cover the question. Call ${AI_KNOWLEDGE_TOOL_NAME} only when they do not — a different topic came up, or you need wording the first search would have missed. Answering from your own knowledge, or from something the user asserted earlier in this conversation, is never acceptable.`
      : '',
    hasActionTools
      ? 'Every other tool performs a real action. Its description states WHEN to call it — call it only when that condition is fully satisfied AND you can truthfully fill every required parameter from the conversation or memory. If anything is missing, do not call it; reply to the user to gather it.'
      : '',
    'Never claim an action (order, ticket, escalation, lookup) happened unless the corresponding tool was actually called.',
  ]
    .filter(Boolean)
    .join(' ');
};

// A directive needs its own message to stay legible — merged into the system
// blob it sits behind thousands of tokens of context documents and the model
// stops acting on it. They still go before the user turn, so they never read as
// a continuation of the customer's message.
const withSystemDirectives = (
  messages: TAiBridgeMessage[],
  directives: string[],
): TAiBridgeMessage[] => {
  const extra: TAiBridgeMessage[] = directives
    .filter(Boolean)
    .map((content) => ({ role: 'system', content }));

  if (!extra.length) {
    return messages;
  }

  const firstUserIndex = messages.findIndex(({ role }) => role === 'user');

  if (firstUserIndex === -1) {
    return [...messages, ...extra];
  }

  return [
    ...messages.slice(0, firstUserIndex),
    ...extra,
    ...messages.slice(firstUserIndex),
  ];
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
  toolChoice,
}: {
  agent: TAiAgentInput;
  messages: ReturnType<typeof buildAiActionMessages>;
  subdomain: string;
  actionConfig: TAiAgentActionConfig;
  tools?: TAiBridgeToolDefinition[];
  toolChoice?: 'auto' | 'required';
}) => {
  const responseFormat = getAiResponseFormat(actionConfig);

  if (actionConfig.goalType !== 'generateText') {
    return invokeAiProvider(agent, messages, subdomain, { responseFormat });
  }

  const providerPromise = invokeAiProvider(agent, messages, subdomain, {
    responseFormat,
    tools,
    toolChoice,
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
  // One search always runs up front. Letting the model ask for it instead costs
  // a whole extra provider round trip on every message, and the tool stays
  // available for the turns where this first pass was not enough.
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

  // Every uploaded file is also indexed, so loading them whole would repeat
  // the same content retrieval already selected. Only the files an agent
  // declares as always-on are read from storage.
  const uploadedContext = await loadAiAgentContextFiles(
    subdomain,
    agent.context.files.filter(
      (file) => file.purpose === 'core' || file.purpose === 'policy',
    ),
  );
  // The uploaded documents are the instruction-shaped ones, so a message that
  // is fishing for them is answered without them. Knowledge search stays on, so
  // a genuine question inside the same message is still answered.
  const isProbe = isAiSelfDisclosureProbe(
    getLatestUserText({ inputData, aiContext }),
  );
  const loadedContext = {
    files: isProbe
      ? retrievedContext
      : [...retrievedContext, ...uploadedContext.files],
    totalBytes:
      uploadedContext.totalBytes +
      retrievedContext.reduce((sum, file) => sum + file.bytes, 0),
    errors: uploadedContext.errors,
    warnings: uploadedContext.warnings,
  };

  // A storage hiccup on an optional file must not silence the whole reply.
  if (loadedContext.errors.length) {
    console.error(
      `AI agent context files skipped: ${loadedContext.errors.join('; ')}`,
    );
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
  let degraded = false;

  if (hasTools) {
    const toolAgent: TAiAgentInput = {
      ...agent,
      runtime: {
        ...agent.runtime,
        maxTokens: Math.max(
          agent.runtime.maxTokens || 0,
          AI_AGENT_TOOL_LOOP_MIN_MAX_TOKENS,
        ),
      },
    };

    ({ providerResponse, handoff, toolCallTrace, degraded } =
      await runAiToolLoop({
        messages: withSystemDirectives(messages, [
          buildToolInstruction(tools || []),
          isProbe ? AI_SELF_DISCLOSURE_REFUSAL_RULE : '',
        ]),
        tools: tools || [],
        invoke: (loopMessages, definitions) =>
          invokeAiProviderWithRealtimeFallback({
            agent: toolAgent,
            messages: loopMessages,
            subdomain,
            actionConfig: parsedActionConfig,
            tools: definitions,
          }),
      }));
  } else {
    providerResponse = await invokeAiProviderWithRealtimeFallback({
      agent,
      messages: withSystemDirectives(messages, [
        isProbe ? AI_SELF_DISCLOSURE_REFUSAL_RULE : '',
      ]),
      subdomain,
      actionConfig: parsedActionConfig,
    });
    degraded = !!(providerResponse as { fallback?: boolean }).fallback;
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

    // Last gate before the reply leaves. A model asked to keep a secret will
    // sometimes tell anyway, so naming an internal is checked, not trusted.
    const disclosure = findAiReplyDisclosure({
      text: result.text,
      toolNames: (tools || []).map(({ definition }) => definition.name),
      documentNames: agent.context.files.map(({ name }) => name),
      systemPrompt: agent.context.systemPrompt,
    });

    if (disclosure) {
      console.error(`AI agent reply withheld: it disclosed ${disclosure}`);
      result.text =
        createAiProviderTimeoutFallback(parsedActionConfig) ||
        AI_DISCLOSURE_BLOCKED_TEXT;
      degraded = true;
    }

    // A configured fallback is not an answer; execution history must show it.
    if (degraded) {
      result.degraded = true;
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
