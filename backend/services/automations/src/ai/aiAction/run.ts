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
import type { TAiAgentLoadedContextFile } from '../aiAgent/context';
import {
  formatAiKnowledgeChunksForPrompt,
  retrieveAiAgentKnowledgeContextFiles,
  type TAiAgentKnowledge,
  type TAiKnowledgeChunk,
} from '../knowledge';
import type { IModels } from '../../connectionResolver';
import { buildAiActionMessages, type TAiKnowledgeReach } from './messages';
import {
  parseAiAgentActionConfig,
  TAiActionExecutionResult,
  TAiAgentActionConfig,
} from './contract';
import { parseAiActionResult } from './parser';
import { runAiToolLoop, TAiToolRuntime } from './tools';
import { AI_KNOWLEDGE_TOOL_ID, AI_KNOWLEDGE_TOOL_NAME } from './knowledgeTool';
import { getLatestUserText, stringifyAiContextValue } from './context';
import {
  buildUngroundedNumbersDirective,
  findUngroundedNumbers,
} from './grounding';
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

// Sent when a reply keeps stating a figure no source contained.
const AI_UNGROUNDED_REPLY_TEXT =
  'Уучлаарай, энэ мэдээллийг баталгаатай хэлэх боломжгүй байна. Танд өөр юугаар туслах вэ?';

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
const buildToolInstruction = (
  tools: TAiToolRuntime[],
  knowledge: TAiAgentKnowledge,
) => {
  const hasKnowledgeTool = tools.some(
    (tool) => tool.toolId === AI_KNOWLEDGE_TOOL_ID,
  );
  const hasActionTools = tools.some(
    (tool) => tool.toolId !== AI_KNOWLEDGE_TOOL_ID,
  );

  return [
    'Tools are available for this reply.',
    hasKnowledgeTool && knowledge.kind === 'indexed'
      ? `The organization's knowledge is not in this conversation. Its sections are:\n${knowledge.indexText}\nBefore stating any fact — prices, items, policies, schedules, availability — call ${AI_KNOWLEDGE_TOOL_NAME} with the matching section and answer from what it returns. Greetings and small talk need no search. A topic with no plausible section is not covered by the knowledge — say so plainly instead of offering to check. Answering facts from your own knowledge, or from something the user asserted earlier in this conversation, is never acceptable.`
      : '',
    hasActionTools
      ? 'Every other tool performs a real action. Its description states WHEN to call it — call it only when that condition is fully satisfied AND you can truthfully fill every required parameter from the conversation or memory. If anything is missing, do not call it; reply to the user to gather it. A tool that records what the user gives needs the thing itself in the messages: when the user only says they will send or add something, ask for it instead of calling the tool. Fill parameters with what the user actually said or sent, never with a description of their request.'
      : '',
    'Never claim an action happened unless the tool that performs it was actually called.',
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

const toKnowledgeContextFiles = (
  agentId: string,
  chunks: TAiKnowledgeChunk[],
): TAiAgentLoadedContextFile[] =>
  chunks.length
    ? [
        {
          id: `knowledge:${agentId}`,
          key: `knowledge:${agentId}`,
          name: 'Knowledge',
          bytes: chunks.reduce((sum, chunk) => sum + chunk.byteSize, 0),
          content: formatAiKnowledgeChunksForPrompt(chunks),
        },
      ]
    : [];

const toKnowledgeReach = (
  knowledge: TAiAgentKnowledge,
  actionConfig: TAiAgentActionConfig,
): TAiKnowledgeReach => {
  if (knowledge.kind === 'full') {
    return 'whole';
  }

  // Only the tool loop sees the index; other goals still get one search.
  return knowledge.kind === 'indexed' &&
    actionConfig.goalType === 'generateText'
    ? 'indexed'
    : 'retrieved';
};

// Small knowledge is read whole; a large one is searched by the model through
// its tool, so only priority passages are preloaded. Goals without a tool loop
// keep the single up-front search.
const loadAiKnowledgeContext = async ({
  subdomain,
  models,
  agentId,
  agent,
  knowledge,
  actionConfig,
  inputData,
  aiContext,
}: {
  subdomain: string;
  models?: IModels;
  agentId?: string;
  agent: TAiAgentInput;
  knowledge: TAiAgentKnowledge;
  actionConfig: TAiAgentActionConfig;
  inputData: unknown;
  aiContext?: TAiContext | null;
}): Promise<TAiAgentLoadedContextFile[]> => {
  if (!models || !agentId || knowledge.kind === 'none') {
    return [];
  }

  if (knowledge.kind === 'full') {
    return toKnowledgeContextFiles(agentId, knowledge.chunks);
  }

  if (actionConfig.goalType === 'generateText') {
    return toKnowledgeContextFiles(agentId, knowledge.alwaysChunks);
  }

  return retrieveAiAgentKnowledgeContextFiles({
    subdomain,
    models,
    agentId,
    agent,
    actionConfig,
    inputData,
    aiContext,
  });
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
  knowledge,
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
  knowledge: TAiAgentKnowledge;
  // Runtime-wired tools for generateText (built by the action executor)
  tools?: TAiToolRuntime[];
}) => {
  const parsedActionConfig = parseAiAgentActionConfig(actionConfig);
  const retrievedContext = await loadAiKnowledgeContext({
    subdomain,
    models,
    agentId,
    agent,
    knowledge,
    actionConfig: parsedActionConfig,
    inputData,
    aiContext,
  });

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

  const hasTools =
    parsedActionConfig.goalType === 'generateText' && !!tools?.length;

  const messages = buildAiActionMessages({
    systemPrompt: agent.context.systemPrompt,
    files: loadedContext.files,
    actionConfig: parsedActionConfig,
    inputData,
    aiContext,
    memory,
    knowledgeReach: toKnowledgeReach(knowledge, parsedActionConfig),
    hasTools,
  });

  let providerResponse;
  let handoff;
  let toolCallTrace;
  let degraded = false;
  let replyMessages: TAiBridgeMessage[];

  const replyAgent: TAiAgentInput = hasTools
    ? {
        ...agent,
        runtime: {
          ...agent.runtime,
          maxTokens: Math.max(
            agent.runtime.maxTokens || 0,
            AI_AGENT_TOOL_LOOP_MIN_MAX_TOKENS,
          ),
        },
      }
    : agent;
  const invokeReply = (
    replyTurn: TAiBridgeMessage[],
    definitions?: TAiBridgeToolDefinition[],
  ) =>
    invokeAiProviderWithRealtimeFallback({
      agent: replyAgent,
      messages: replyTurn,
      subdomain,
      actionConfig: parsedActionConfig,
      tools: definitions,
    });

  if (hasTools) {
    ({
      providerResponse,
      handoff,
      toolCallTrace,
      degraded,
      messages: replyMessages,
    } = await runAiToolLoop({
      messages: withSystemDirectives(messages, [
        buildToolInstruction(tools || [], knowledge),
        isProbe ? AI_SELF_DISCLOSURE_REFUSAL_RULE : '',
      ]),
      tools: tools || [],
      invoke: invokeReply,
    }));
  } else {
    replyMessages = withSystemDirectives(messages, [
      isProbe ? AI_SELF_DISCLOSURE_REFUSAL_RULE : '',
    ]);
    providerResponse = await invokeReply(replyMessages);
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

    // A figure no source contained gets one rewrite; if it survives, the
    // reply is withheld rather than sent with an invented price.
    if (!handoff && knowledge.kind !== 'none') {
      const sources = [
        ...loadedContext.files.map(({ content }) => content),
        ...(toolCallTrace || []).map(({ result: toolResult }) =>
          stringifyAiContextValue(toolResult),
        ),
        stringifyAiContextValue(inputData),
        stringifyAiContextValue(aiContext?.input?.text),
        ...(aiContext?.history || []).map(({ text }) => text || ''),
        agent.context.systemPrompt || '',
        stringifyAiContextValue(memory),
      ];
      const ungroundedNumbers = findUngroundedNumbers({
        reply: result.text,
        sources,
      });

      if (ungroundedNumbers.length) {
        result.ungroundedNumbers = ungroundedNumbers;

        const retryResponse = await invokeReply(
          [
            ...replyMessages,
            { role: 'assistant', content: providerResponse.text || '' },
            {
              role: 'user',
              content: buildUngroundedNumbersDirective(ungroundedNumbers),
            },
          ],
          hasTools
            ? (tools || []).map(({ definition }) => definition)
            : undefined,
        );
        const retried = parseAiActionResult({
          actionConfig: parsedActionConfig,
          text: retryResponse.text,
          usage: retryResponse.usage,
        });
        const grounded =
          retried.type === 'generateText' &&
          !!retried.text.trim() &&
          !findUngroundedNumbers({ reply: retried.text, sources }).length;

        if (grounded && retried.type === 'generateText') {
          result.text = retried.text;
          result.attributes = retried.attributes ?? result.attributes;
        } else {
          result.text =
            createAiProviderTimeoutFallback(parsedActionConfig) ||
            AI_UNGROUNDED_REPLY_TEXT;
          degraded = true;
        }

        result.usage = {
          inputTokens:
            (result.usage?.inputTokens || 0) +
            (retryResponse.usage?.inputTokens || 0),
          outputTokens:
            (result.usage?.outputTokens || 0) +
            (retryResponse.usage?.outputTokens || 0),
          totalTokens:
            (result.usage?.totalTokens || 0) +
            (retryResponse.usage?.totalTokens || 0),
        };
      }
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
  };
};
