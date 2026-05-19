import { TAiContext } from 'erxes-api-shared/core-modules';
import { TAiAgentInput, loadAiAgentContextFiles } from '../aiAgent';
import { invokeAiProvider } from '../bridge';
import { retrieveAiAgentKnowledgeContextFiles } from '../knowledge';
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
  if (actionConfig.goalType !== 'generateText') {
    return invokeAiProvider(agent, messages, subdomain);
  }

  const providerPromise = invokeAiProvider(agent, messages, subdomain).catch(
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
        timeoutId = setTimeout(
          () => {
            const fallbackResponse =
              createAiProviderFallbackResponse(actionConfig);

            if (fallbackResponse) {
              resolve(fallbackResponse);
            }
          },
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
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
}: {
  subdomain: string;
  agent: TAiAgentInput;
  agentId?: string;
  models?: IModels;
  actionConfig: unknown;
  inputData: unknown;
  aiContext?: TAiContext | null;
  memory?: Record<string, unknown>;
}) => {
  const parsedActionConfig = parseAiAgentActionConfig(actionConfig);
  const retrievedContext =
    models && agentId
      ? await retrieveAiAgentKnowledgeContextFiles({
          models,
          agentId,
          agent,
          actionConfig: parsedActionConfig,
          inputData,
          aiContext,
        })
      : [];

  const loadedContext = retrievedContext.length
    ? {
        files: retrievedContext,
        totalBytes: retrievedContext.reduce((sum, file) => sum + file.bytes, 0),
        errors: [],
        warnings: [],
      }
    : await loadAiAgentContextFiles(subdomain, agent.context.files);

  if (loadedContext.errors.length) {
    throw new Error(loadedContext.errors.join('\n'));
  }

  const messages = buildAiActionMessages({
    systemPrompt: agent.context.systemPrompt,
    files: loadedContext.files,
    actionConfig: parsedActionConfig,
    inputData,
    aiContext,
    memory,
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
  };
};
