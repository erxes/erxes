import {
  IAutomationExecutionDocument,
  TAiContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '../../connectionResolver';
import {
  TAiActionExecutionResult,
  TAiAgentActionConfig,
} from '../aiAction/contract';

const getNestedValue = (obj: any, path = '') => {
  if (!path) {
    return undefined;
  }

  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const compactObject = (value: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(value).filter(
      ([, currentValue]) =>
        currentValue !== null &&
        currentValue !== undefined &&
        currentValue !== '',
    ),
  );

const stringifyScopeValue = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  if (
    value &&
    typeof value === 'object' &&
    typeof value.toString === 'function'
  ) {
    const normalized = value.toString().trim();

    if (normalized && normalized !== '[object Object]') {
      return normalized;
    }
  }

  return null;
};

const resolveScopeKey = (
  execution: IAutomationExecutionDocument,
  aiContext?: TAiContext | null,
) => {
  return (
    stringifyScopeValue(aiContext?.memory?.scopeKey) ||
    stringifyScopeValue(execution.targetId) ||
    stringifyScopeValue(execution.target?._id) ||
    stringifyScopeValue(execution._id) ||
    String(execution._id || '')
  );
};

const pickWriteValue = (
  result: TAiActionExecutionResult,
  resultPath?: string,
) => {
  return resultPath ? getNestedValue(result, resultPath) : result;
};

export const loadAiActionMemory = async ({
  models,
  execution,
  actionConfig,
  aiContext,
}: {
  models: IModels;
  execution: IAutomationExecutionDocument;
  actionConfig: TAiAgentActionConfig;
  aiContext?: TAiContext | null;
}) => {
  const readConfig = actionConfig.memory?.read;

  if (!readConfig?.enabled) {
    return {};
  }

  const scopeKey = resolveScopeKey(execution, aiContext);

  if (!scopeKey) {
    return {};
  }

  const memory = await models.AutomationMemory.findOne({
    automationId: execution.automationId,
    namespace: readConfig.namespace,
    scopeKey,
  }).lean();

  return (memory?.data || {}) as Record<string, unknown>;
};

export const persistAiActionMemory = async ({
  models,
  execution,
  actionConfig,
  result,
  aiContext,
}: {
  models: IModels;
  execution: IAutomationExecutionDocument;
  actionConfig: TAiAgentActionConfig;
  result: TAiActionExecutionResult;
  aiContext?: TAiContext | null;
}) => {
  const writeConfig = actionConfig.memory?.write;

  if (!writeConfig?.enabled) {
    return null;
  }

  const scopeKey = resolveScopeKey(execution, aiContext);

  if (!scopeKey) {
    return null;
  }

  const current = await models.AutomationMemory.findOne({
    automationId: execution.automationId,
    namespace: writeConfig.namespace,
    scopeKey,
  }).lean();

  const currentData = (current?.data || {}) as Record<string, unknown>;
  const nextValue = pickWriteValue(result, writeConfig.resultPath);
  const currentValue = currentData[writeConfig.key];

  const data =
    writeConfig.mode === 'merge' &&
    isPlainObject(currentValue) &&
    isPlainObject(nextValue)
      ? {
          ...currentData,
          [writeConfig.key]: {
            ...currentValue,
            ...compactObject(nextValue),
          },
        }
      : {
          ...currentData,
          [writeConfig.key]: nextValue,
        };

  const expiresAt = new Date(Date.now() + writeConfig.ttlMinutes * 60 * 1000);

  await models.AutomationMemory.updateOne(
    {
      automationId: execution.automationId,
      namespace: writeConfig.namespace,
      scopeKey,
    },
    {
      $set: {
        data,
        expiresAt,
      },
      $setOnInsert: {
        automationId: execution.automationId,
        namespace: writeConfig.namespace,
        scopeKey,
      },
    },
    { upsert: true },
  );

  return data;
};
