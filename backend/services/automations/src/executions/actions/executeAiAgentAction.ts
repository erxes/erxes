import {
  loadAiActionMemory,
  parseAiAgentActionConfig,
  parseAiAgentInput,
  persistAiActionMemory,
  runAiAction,
  TAiActionExecutionResult,
} from '../../ai';
import { generateModels } from '../../connectionResolver';
import {
  getContentType,
  getModuleName,
  getPluginName,
  IAutomationAction,
  IAutomationExecutionDocument,
  TAiContext,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';

type TAiAgentActionWorkerResponse = {
  result: TAiActionExecutionResult;
  nextActionId?: string;
};

export const executeAiAgentAction = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  action: IAutomationAction,
): Promise<TAiAgentActionWorkerResponse> => {
  try {
    const models = await generateModels(subdomain);
    const parsedActionConfig = parseAiAgentActionConfig(action.config);
    const aiContext = await getAiContext(subdomain, execution);
    const inputData = await getInputData(
      execution,
      parsedActionConfig.inputMapping,
    );
    const memory = await loadAiActionMemory({
      models,
      execution,
      actionConfig: parsedActionConfig,
      aiContext,
    });
    const aiAgentId = parsedActionConfig.aiAgentId;

    if (!aiAgentId) {
      throw new Error('AI action config is missing aiAgentId.');
    }

    const agent = await models.AiAgents.findById({ _id: aiAgentId }).lean();

    if (!agent) {
      throw new Error('AI Agent not found.');
    }
    const timerLabel = `runAiAction:${execution._id}:${action.id}`;
    console.time(timerLabel);
    const response = await runAiAction({
      subdomain,
      agent: parseAiAgentInput(agent),
      agentId: aiAgentId,
      models,
      actionConfig: parsedActionConfig,
      inputData,
      aiContext,
      memory,
    });
    console.timeEnd(timerLabel);
    if (!response) {
      throw new Error('AI agent returned an empty response.');
    }

    await persistAiActionMemory({
      models,
      execution,
      actionConfig: parsedActionConfig,
      result: response.result,
      aiContext,
    });

    return response;
  } catch (error) {
    throw new Error(`AI Agent Action failed: ${error.message}`);
  }
};

const getAiContext = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
): Promise<TAiContext | null> => {
  const { triggerType, target } = execution;

  const pluginName = getPluginName(triggerType || '');
  const moduleName = getModuleName(triggerType || '');
  const collectionType = getContentType(triggerType || '');

  if (!pluginName || !moduleName || !collectionType || !target) {
    return null;
  }

  try {
    return await sendCoreModuleProducer({
      moduleName: 'automations',
      subdomain,
      pluginName,
      producerName: TAutomationProducers.GENERATE_AI_CONTEXT,
      input: {
        moduleName,
        collectionType,
        triggerType,
        target,
      },
      defaultValue: null,
    });
  } catch (_error) {
    return null;
  }
};

const getInputData = async (
  execution: IAutomationExecutionDocument,
  inputMapping: any,
) => {
  if (!inputMapping?.source) {
    if (typeof execution.target === 'string') {
      return execution.target;
    }

    if (typeof execution.target?.content === 'string') {
      return execution.target.content;
    }

    if (typeof execution.target?.message === 'string') {
      return execution.target.message;
    }

    if (typeof execution.target?.text === 'string') {
      return execution.target.text;
    }

    return execution.target;
  }

  switch (inputMapping.source) {
    case 'trigger':
      return inputMapping.path
        ? getNestedValue(execution.target, inputMapping.path)
        : execution.target;
    case 'previousAction':
      const prevAction = (execution.actions || []).find(
        (a: any) => a.id === inputMapping.path,
      );
      return prevAction?.result;
    case 'custom':
      return inputMapping.customValue;
    default:
      return '';
  }
};

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};
