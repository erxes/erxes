import {
  replaceOutputPlaceholders,
  splitType,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import { itemsAdd } from '~/modules/sales/utils';

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
  const [pluginName, , collectionName] = splitType(triggerType || '');

  const resolvedConfig = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: config,
    defaultValue: '',
  });

  const newData = normalizeDealActionData(resolvedConfig);

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

  normalizePropertiesData(newData);

  return newData;
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

  const [serviceName, , sourceType] = splitType(execution?.triggerType || '');

  if (!serviceName || serviceName === 'sales' || !execution?.targetId) {
    return;
  }

  if (!sourceType) {
    return;
  }
  const isContactTrigger = ['customers', 'leads', 'companies'].includes(
    sourceType,
  );

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

const hasOwn = (target: any, key: string) =>
  Object.prototype.hasOwnProperty.call(target || {}, key);
