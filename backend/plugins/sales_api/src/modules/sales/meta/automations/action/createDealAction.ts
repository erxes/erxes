import {
  splitType,
  STATIC_PLACEHOLDER,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import {
  sendCoreModuleProducer,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import moment from 'moment';
import { IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import { itemsAdd } from '~/modules/sales/utils';

const PLACEHOLDER_REGEX = /{{\s*([^{}]+?)\s*}}/g;

type TPlaceholderValues = Record<string, unknown>;

export const createDealAction = async ({
  models,
  subdomain,
  action,
  execution,
  collectionType,
}: {
  models: IModels;
  subdomain: string;
  action: any;
  execution: any;
  collectionType: string;
}) => {
  const config = { ...(action.config || {}) };
  const { target = {}, triggerType } = execution || {};
  const [pluginName, moduleName, collectionName] = splitType(triggerType || '');

  const resolvedValues = await resolveActionOutputPlaceholders({
    subdomain,
    execution,
    config,
  });

  const newData = normalizeDealActionData(
    replacePlaceholders(config, resolvedValues),
  );

  if (execution?.target?.userId) {
    newData.userId = execution.target.userId;
  }

  if (execution?.triggerType === 'inbox:conversation') {
    newData.sourceConversationIds = [execution.targetId];
  }

  if (
    ['core:customer', 'core:lead'].includes(execution?.triggerType) &&
    execution?.target?.isFormSubmission
  ) {
    newData.sourceConversationIds = [execution.target.conversationId];
  }

  if (
    ['customers', 'leads', 'companies'].includes(collectionName) &&
    pluginName === 'core'
  ) {
    newData.customerIds = toIds(execution.targetId);
  }

  if (hasOwn(newData, 'attachments')) {
    const [serviceName] = splitType(triggerType || '');

    if (serviceName === 'sales') {
      const item = await models.Deals.findOne({ _id: target._id });
      newData.attachments = item?.attachments || target?.attachments;
    }
  }

  const item = await itemsAdd(
    models,
    subdomain,
    newData as IDeal & { processId: string; aboveItemId: string },
    collectionType,
    models.Deals.createDeal,
  );

  await createSourceRelation({
    subdomain,
    execution,
    dealId: item._id,
  });

  return {
    name: item.name,
    targetId: item._id,
    stageId: item.stageId,
    pipelineId: newData.pipelineId,
    boardId: newData.boardId,
  };
};

const resolveActionOutputPlaceholders = async ({
  subdomain,
  execution,
  config,
}: {
  subdomain: string;
  execution: any;
  config: Record<string, any>;
}): Promise<TPlaceholderValues> => {
  const placeholderKeys = collectPlaceholderKeys(config);
  const triggerPaths = placeholderKeys
    .map(getTriggerOutputPath)
    .filter(Boolean) as string[];
  const values: TPlaceholderValues = {};

  for (const key of placeholderKeys) {
    const dateValue = resolveDatePlaceholder(key);

    if (dateValue) {
      values[key] = dateValue;
    }
  }

  if (triggerPaths.length) {
    const [pluginName] = splitType(execution?.triggerType || '');

    if (pluginName) {
      const resolved = await sendCoreModuleProducer({
        subdomain,
        moduleName: 'automations',
        pluginName,
        producerName: TAutomationProducers.RESOLVE_OUTPUT_PATHS,
        input: {
          nodeType: execution.triggerType,
          source: execution.target || {},
          paths: [...new Set(triggerPaths)],
          defaultValue: '',
        },
        defaultValue: {},
      }).catch(() => ({}));

      for (const key of placeholderKeys) {
        const triggerPath = getTriggerOutputPath(key);

        if (!triggerPath || !hasOwn(resolved, triggerPath)) {
          continue;
        }

        values[key] = resolved[triggerPath];
      }
    }
  }

  return {
    ...values,
    ...resolvePreviousActionPlaceholders({
      execution,
      placeholderKeys,
    }),
  };
};

const collectPlaceholderKeys = (value: unknown, result = new Set<string>()) => {
  if (typeof value === 'string') {
    for (const match of value.matchAll(PLACEHOLDER_REGEX)) {
      result.add(match[1].trim());
    }

    return [...result];
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectPlaceholderKeys(item, result));
    return [...result];
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) =>
      collectPlaceholderKeys(item, result),
    );
  }

  return [...result];
};

const replacePlaceholders = (
  value: unknown,
  placeholderValues: TPlaceholderValues,
): any => {
  if (typeof value === 'string') {
    return replaceStringPlaceholders(value, placeholderValues);
  }

  if (Array.isArray(value)) {
    return value.map((item) => replacePlaceholders(item, placeholderValues));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replacePlaceholders(item, placeholderValues),
      ]),
    );
  }

  return value;
};

const replaceStringPlaceholders = (
  value: string,
  placeholderValues: TPlaceholderValues,
) => {
  const fullMatch = value.match(/^{{\s*([^{}]+?)\s*}}$/);

  if (fullMatch) {
    return readPlaceholderValue(fullMatch[1].trim(), placeholderValues);
  }

  return value.replace(PLACEHOLDER_REGEX, (_match, key) =>
    stringifyPlaceholderValue(
      readPlaceholderValue(String(key).trim(), placeholderValues),
    ),
  );
};

const readPlaceholderValue = (
  key: string,
  placeholderValues: TPlaceholderValues,
) => {
  if (hasOwn(placeholderValues, key)) {
    return placeholderValues[key];
  }

  return '';
};

const stringifyPlaceholderValue = (value: unknown) => {
  if (value === undefined || value === null) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(stringifyPlaceholderValue).filter(Boolean).join(', ');
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const getTriggerOutputPath = (placeholderKey: string) => {
  if (resolveDatePlaceholder(placeholderKey)) {
    return null;
  }

  if (placeholderKey.startsWith('trigger.')) {
    return placeholderKey.slice('trigger.'.length);
  }

  if (placeholderKey.startsWith('actions.')) {
    return null;
  }

  return placeholderKey;
};

const resolvePreviousActionPlaceholders = ({
  execution,
  placeholderKeys,
}: {
  execution: any;
  placeholderKeys: string[];
}) => {
  const values: TPlaceholderValues = {};

  for (const key of placeholderKeys) {
    if (!key.startsWith('actions.')) {
      continue;
    }

    const [, actionId, ...pathParts] = key.split('.');
    const actionExecution = (execution?.actions || []).find(
      (item) => item.actionId === actionId,
    );

    values[key] = readPath(actionExecution?.result, pathParts.join('.')) ?? '';
  }

  return values;
};

const normalizeDealActionData = (data: Record<string, any>) => {
  const newData = { ...data };

  if (hasOwn(newData, 'assignedTo')) {
    newData.assignedUserIds = toIds(newData.assignedTo);
    delete newData.assignedTo;
  }

  if (hasOwn(newData, 'cardName')) {
    newData.name = newData.cardName;
    delete newData.cardName;
  }

  if (hasOwn(newData, 'customers')) {
    newData.customerIds = toIds(newData.customers);
    delete newData.customers;
  }

  if (hasOwn(newData, 'companies')) {
    newData.companyIds = toIds(newData.companies);
    delete newData.companies;
  }

  [
    'assignedUserIds',
    'labelIds',
    'tagIds',
    'branchIds',
    'departmentIds',
    'customerIds',
    'companyIds',
    'sourceConversationIds',
  ].forEach((key) => {
    if (hasOwn(newData, key)) {
      newData[key] = toIds(newData[key]);
    }
  });

  normalizeCustomFieldsData(newData);
  normalizePropertiesData(newData);

  return newData;
};

const normalizeCustomFieldsData = (data: Record<string, any>) => {
  const fieldKeys = Object.keys(data).filter((key) =>
    key.startsWith('customFieldsData.'),
  );

  if (!fieldKeys.length) {
    return;
  }

  const customFieldsData = Array.isArray(data.customFieldsData)
    ? [...data.customFieldsData]
    : [];

  for (const fieldKey of fieldKeys) {
    const [, fieldId] = fieldKey.split('.');

    customFieldsData.push({
      field: fieldId,
      value: data[fieldKey],
    });

    delete data[fieldKey];
  }

  data.customFieldsData = customFieldsData;
};

const normalizePropertiesData = (data: Record<string, any>) => {
  const fieldKeys = Object.keys(data).filter((key) =>
    key.startsWith('propertiesData.'),
  );

  if (!fieldKeys.length) {
    return;
  }

  const propertiesData =
    data.propertiesData &&
    !Array.isArray(data.propertiesData) &&
    typeof data.propertiesData === 'object'
      ? { ...data.propertiesData }
      : {};

  for (const fieldKey of fieldKeys) {
    const fieldId = fieldKey.replace('propertiesData.', '');
    propertiesData[fieldId] = data[fieldKey];
    delete data[fieldKey];
  }

  data.propertiesData = propertiesData;
};

const toIds = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(toIds);
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  if (typeof value === 'object') {
    const id = (value as Record<string, unknown>)._id;
    return id ? [String(id)] : [];
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const createSourceRelation = async ({
  subdomain,
  execution,
  dealId,
}: {
  subdomain: string;
  execution: any;
  dealId: string;
}) => {
  if (execution?.triggerType === 'inbox:conversation') {
    const customerId = execution?.target?.customerId;

    if (!customerId) {
      return;
    }

    return sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'relation',
      action: 'createRelation',
      input: {
        entities: [
          {
            contentType: 'core:customer',
            contentId: customerId,
          },
          {
            contentType: 'sales:deal',
            contentId: dealId,
          },
        ],
      },
    });
  }

  const [serviceName, _module, sourceType] = splitType(
    execution?.triggerType || '',
  );

  if (!serviceName || serviceName === 'sales' || !execution?.targetId) {
    return;
  }

  if (!sourceType) {
    return;
  }
  const isContactTrigger = ['customers', 'leads', 'companies'].includes(
    sourceType,
  );

  console.log({ isContactTrigger, sourceType });

  if (isContactTrigger) {
    const contentTypes = {
      customers: 'core:customer',
      leads: 'core:customer',
      companies: 'core:company',
    };

    return sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'relation',
      action: 'createRelation',
      input: {
        relation: {
          entities: [
            {
              contentType: contentTypes[sourceType],
              contentId: execution.targetId,
            },
            {
              contentType: 'sales:deal',
              contentId: dealId,
            },
          ],
        },
      },
    });
  }
};

const resolveDatePlaceholder = (key: string) => {
  const fullKey = `{{ ${key} }}`;

  if (hasOwn(STATIC_PLACEHOLDER, fullKey)) {
    return moment().add(STATIC_PLACEHOLDER[fullKey], 'days').toISOString();
  }

  const dynamicDate = key.match(/^now\+(\d+)d$/);

  if (dynamicDate) {
    return moment().add(Number(dynamicDate[1]), 'days').toISOString();
  }

  return null;
};

const readPath = (target: any, path: string) => {
  if (!path) {
    return target;
  }

  return path.split('.').reduce((current, key) => current?.[key], target);
};

const hasOwn = (target: any, key: string) =>
  Object.prototype.hasOwnProperty.call(target || {}, key);
