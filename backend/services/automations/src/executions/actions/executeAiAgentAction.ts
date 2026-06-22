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
    const parsedActionConfig = parseAiAgentActionConfig(
      resolveRuntimeConfigValue(
        parseAiAgentActionConfig(action.config),
        execution,
      ),
    );
    const aiContext = await getAiContext(subdomain, execution);
    const inputData = await getInputData(execution, parsedActionConfig);
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
  inputConfig: {
    input?: string;
    inputMapping?: {
      source: 'trigger' | 'previousAction' | 'custom';
      path?: string;
      customValue?: string;
    };
  },
) => {
  if (inputConfig.input !== undefined) {
    return inputConfig.input.trim() ? inputConfig.input : execution.target;
  }

  const { inputMapping } = inputConfig;

  if (!inputMapping?.source) {
    return execution.target;
  }

  switch (inputMapping.source) {
    case 'trigger': {
      const triggerPath = inputMapping.path?.startsWith('trigger.')
        ? inputMapping.path.slice(8)
        : inputMapping.path;
      return triggerPath
        ? getNestedValue(execution.target, triggerPath)
        : execution.target;
    }
    case 'previousAction': {
      return getActionResult(execution, inputMapping.path);
    }
    case 'custom':
      return resolveRuntimeValue(inputMapping.customValue, execution);
    default:
      return '';
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const getActionResult = (
  execution: IAutomationExecutionDocument,
  actionId?: string,
) => {
  const action = (execution.actions || []).find((executionAction) => {
    if (!isRecord(executionAction)) {
      return false;
    }

    return (
      executionAction.actionId === actionId || executionAction.id === actionId
    );
  });

  return isRecord(action) ? action.result : undefined;
};

const getNestedValue = (obj: unknown, path: string) => {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .reduce<unknown>((current, key) => {
      if (Array.isArray(current)) {
        const index = Number(key);

        return Number.isInteger(index) ? current[index] : undefined;
      }

      return isRecord(current) ? current[key] : undefined;
    }, obj);
};

const getActionResultValue = (
  execution: IAutomationExecutionDocument,
  actionId: string,
  path: string,
) => {
  return getNestedValue(getActionResult(execution, actionId), path);
};

const resolveRuntimeToken = (
  tokenPath: string,
  execution: IAutomationExecutionDocument,
) => {
  if (tokenPath.startsWith('trigger.')) {
    return getNestedValue(execution.target || {}, tokenPath.slice(8));
  }

  if (tokenPath.startsWith('actions.')) {
    const [, actionId, ...pathSegments] = tokenPath.split('.');
    return getActionResultValue(execution, actionId, pathSegments.join('.'));
  }

  return getNestedValue(execution.target || {}, tokenPath);
};

const stringifyResolvedValue = (value: unknown) => {
  if (value === undefined || value === null) {
    return '';
  }

  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

const resolveRuntimeString = (
  value: string,
  execution: IAutomationExecutionDocument,
) => {
  const tokenRegex = /{{\s*([^}]+)\s*}}/g;
  const matches = [...value.matchAll(tokenRegex)];

  if (!matches.length) {
    return value;
  }

  const fullTokenMatch =
    matches.length === 1 && matches[0][0].trim() === value.trim();

  if (fullTokenMatch) {
    const resolved = resolveRuntimeToken(matches[0][1].trim(), execution);
    return resolved === undefined ? value : resolved;
  }

  return matches.reduce((processed, match) => {
    const resolved = resolveRuntimeToken(match[1].trim(), execution);
    return processed.replace(match[0], stringifyResolvedValue(resolved));
  }, value);
};

const resolveRuntimeValue = (
  value: unknown,
  execution: IAutomationExecutionDocument,
): unknown => {
  if (typeof value === 'string') {
    return resolveRuntimeString(value, execution);
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveRuntimeValue(item, execution));
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, currentValue]) => [
      key,
      resolveRuntimeValue(currentValue, execution),
    ]),
  );
};

const resolveRuntimeConfigValue = (
  value: unknown,
  execution: IAutomationExecutionDocument,
): unknown => {
  if (typeof value === 'string') {
    const resolved = resolveRuntimeString(value, execution);
    return typeof resolved === 'string'
      ? resolved
      : stringifyResolvedValue(resolved);
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveRuntimeConfigValue(item, execution));
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, currentValue]) => [
      key,
      resolveRuntimeConfigValue(currentValue, execution),
    ]),
  );
};
