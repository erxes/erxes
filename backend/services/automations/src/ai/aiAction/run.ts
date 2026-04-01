import { TAiContext } from 'erxes-api-shared/core-modules';
import { TAiAgentInput, loadAiAgentContextFiles } from '../aiAgent';
import { invokeAiProvider } from '../bridge';
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

export const runAiAction = async ({
  subdomain,
  agent,
  actionConfig,
  inputData,
  aiContext,
}: {
  subdomain: string;
  agent: TAiAgentInput;
  actionConfig: unknown;
  inputData: unknown;
  aiContext?: TAiContext | null;
}) => {
  const parsedActionConfig = parseAiAgentActionConfig(actionConfig);
  const loadedContext = await loadAiAgentContextFiles(
    subdomain,
    agent.context.files,
  );

  if (loadedContext.errors.length) {
    throw new Error(loadedContext.errors.join('\n'));
  }

  const providerResponse = await invokeAiProvider(
    agent,
    buildAiActionMessages({
      systemPrompt: agent.context.systemPrompt,
      files: loadedContext.files,
      actionConfig: parsedActionConfig,
      inputData,
      aiContext,
    }),
  );

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
