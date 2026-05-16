import {
  IAutomationAction,
  IAutomationExecutionDocument,
  splitType,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';

type TTransformMapping = {
  key?: string;
  value?: any;
  type?: 'text' | 'number' | 'boolean' | 'object' | 'array';
};

const getValueByPath = (source: any, path: string) => {
  if (!path) {
    return source;
  }

  return path.split('.').reduce((current, segment) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    return current[segment];
  }, source);
};

const setValueByPath = (
  target: Record<string, any>,
  path: string,
  value: any,
) => {
  const segments = path.split('.').filter(Boolean);
  const lastSegment = segments.pop();

  if (!lastSegment) {
    return;
  }

  let current = target;
  for (const segment of segments) {
    if (
      !current[segment] ||
      typeof current[segment] !== 'object' ||
      Array.isArray(current[segment])
    ) {
      current[segment] = {};
    }

    current = current[segment];
  }

  current[lastSegment] = value;
};

const getActionResultValue = (
  execution: IAutomationExecutionDocument,
  actionId: string,
  path: string,
) => {
  const action = (execution.actions || []).find(
    (execAction) => execAction.actionId === actionId,
  );

  return getValueByPath(action?.result, path);
};

const parseBoolean = (value: any) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  const normalized = String(value).trim().toLowerCase();
  return ['true', '1', 'yes', 'y'].includes(normalized);
};

const parseJsonValue = (value: any, fallback: any) => {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const coerceValue = (value: any, type: TTransformMapping['type']) => {
  if (value === undefined || value === null) {
    return value;
  }

  if (type === 'number') {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? 0 : numberValue;
  }

  if (type === 'boolean') {
    return parseBoolean(value);
  }

  if (type === 'object') {
    return parseJsonValue(value, {});
  }

  if (type === 'array') {
    const parsed = parseJsonValue(value, []);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  return String(value);
};

const resolveRuntimeToken = (
  tokenPath: string,
  execution: IAutomationExecutionDocument,
) => {
  if (tokenPath.startsWith('trigger.')) {
    return getValueByPath(execution.target || {}, tokenPath.slice(8));
  }

  if (tokenPath.startsWith('actions.')) {
    const [, actionId, ...pathSegments] = tokenPath.split('.');
    return getActionResultValue(execution, actionId, pathSegments.join('.'));
  }

  return undefined;
};

const resolveRuntimeValue = (
  value: any,
  execution: IAutomationExecutionDocument,
) => {
  if (typeof value !== 'string') {
    return value;
  }

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
    return processed.replace(
      match[0],
      resolved === undefined || resolved === null ? '' : String(resolved),
    );
  }, value);
};

const replacePlaceholders = async ({
  subdomain,
  triggerType,
  targetType,
  execution,
  values,
}: {
  subdomain: string;
  triggerType: string;
  targetType: string;
  execution: IAutomationExecutionDocument;
  values: Record<string, any>;
}) => {
  const placeholderSourceType =
    typeof targetType === 'string' && targetType.includes(':')
      ? targetType
      : triggerType;
  const [pluginName, moduleName] = splitType(placeholderSourceType || '');

  if (!pluginName) {
    return values;
  }

  const valuesToReplace = Object.entries(values).reduce<Record<string, any>>(
    (acc, [key, value]) => {
      if (typeof value === 'string' && value.includes('{{')) {
        acc[key] = value;
      }

      return acc;
    },
    {},
  );

  if (!Object.keys(valuesToReplace).length) {
    return values;
  }

  const replacedValues = await sendCoreModuleProducer({
    subdomain,
    moduleName: 'automations',
    pluginName,
    producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
    input: {
      moduleName,
      target: execution.target || {},
      config: valuesToReplace,
    },
    defaultValue: valuesToReplace,
  });

  return { ...values, ...(replacedValues || {}) };
};

export const executeTransformAction = async ({
  subdomain,
  triggerType,
  targetType,
  execution,
  action,
}: {
  subdomain: string;
  triggerType: string;
  targetType: string;
  execution: IAutomationExecutionDocument;
  action: IAutomationAction;
}) => {
  const mappings: TTransformMapping[] = action.config?.mappings || [];
  const rawValues = mappings.reduce<Record<string, any>>((acc, mapping) => {
    if (!mapping.key) {
      return acc;
    }

    acc[mapping.key] = resolveRuntimeValue(mapping.value, execution);
    return acc;
  }, {});

  const replacedValues = await replacePlaceholders({
    subdomain,
    triggerType,
    targetType,
    execution,
    values: rawValues,
  });

  const data = mappings.reduce<Record<string, any>>((acc, mapping) => {
    if (!mapping.key) {
      return acc;
    }

    setValueByPath(
      acc,
      mapping.key,
      coerceValue(replacedValues?.[mapping.key], mapping.type),
    );
    return acc;
  }, {});

  return { data };
};
