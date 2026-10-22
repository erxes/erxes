import {
  replaceOutputPlaceholders,
  splitType,
} from 'erxes-api-shared/core-modules';
import { TCreatedVia } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import { itemsAdd, setDealContacts } from '~/modules/sales/utils';
import { syncWrittenDealPoints } from '~/modules/sales/utils/dealPoints';

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

  const createdVia = getCreatedVia(execution);

  if (execution?.target?.userId) {
    newData.userId = execution.target.userId;
  } else if (createdVia?.actorId) {
    // Nobody pressed create: the deal belongs to whoever set going the thing
    // that asked for this run — a campaign names who put it live.
    newData.userId = createdVia.actorId;
  }

  // Not who pressed create — what produced it.
  newData.createdVia = createdVia;

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
    newData.customerId = toIds(execution.targetId)[0];
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

  await setSourceContact({
    models,
    execution,
    dealId: item._id,
  });

  // After the relation: the customer it links is who earns.
  await syncWrittenDealPoints({
    subdomain,
    models,
    dealIds: [item._id],
    userId: item.userId,
  });

  return {
    name: item.name,
    targetId: item._id,
    stageId: item.stageId,
    pipelineId: newData.pipelineId,
    boardId: newData.boardId,
  };
};

/** What produced this run, to carry onto whatever it creates. */
const getCreatedVia = (execution: any): TCreatedVia | undefined => {
  const via = execution?.createdVia;

  return via && typeof via === 'object' && via.sourceId ? via : undefined;
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

  // A deal keeps one customer and one company: the first chosen.
  if (hasOwn(newData, 'customers')) {
    newData.customerId = toIds(newData.customers)[0];
    delete newData.customers;
  }

  if (hasOwn(newData, 'companies')) {
    newData.companyId = toIds(newData.companies)[0];
    delete newData.companies;
  }

  [
    'assignedUserIds',
    'labelIds',
    'tagIds',
    'branchIds',
    'departmentIds',
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

// The contact the automation ran for becomes the deal's own contact.
const setSourceContact = async ({
  models,
  execution,
  dealId,
}: {
  models: IModels;
  execution: any;
  dealId: string;
}) => {
  if (execution?.triggerType === 'inbox:conversation') {
    const customerId = execution?.target?.customerId;

    if (customerId) {
      await setDealContacts(models, { dealId, customerId });
    }

    return;
  }

  const [serviceName, , sourceType] = splitType(execution?.triggerType || '');

  if (
    !serviceName ||
    serviceName === 'sales' ||
    !execution?.targetId ||
    !sourceType
  ) {
    return;
  }

  if (['customers', 'leads'].includes(sourceType)) {
    await setDealContacts(models, {
      dealId,
      customerId: execution.targetId,
    });
  }

  if (sourceType === 'companies') {
    await setDealContacts(models, {
      dealId,
      companyId: execution.targetId,
    });
  }
};

const hasOwn = (target: any, key: string) =>
  Object.prototype.hasOwnProperty.call(target || {}, key);
