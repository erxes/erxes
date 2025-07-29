import { replacePlaceHolders } from '@erxes/api-utils/src/automations';
import { getCollection } from '../models/utils';
import { itemsAdd } from '../graphql/resolvers/mutations/utils';
import { sendCoreMessage } from '../messageBroker';
import { getRelatedValue } from './getRelatedValue';
export const actionCreate = async ({
  models,
  subdomain,
  action,
  execution,
  collectionType
}) => {
  const { config = {} } = action;
  let { target, triggerType } = execution || {};
  let relatedValueProps = {};

  let newData = action.config.assignedTo
    ? await replacePlaceHolders({
        models,
        subdomain,
        getRelatedValue,
        actionData: { assignedTo: action.config.assignedTo },
        target: {
          ...target,
          type: (triggerType || '').replace('tickets:', '')
        },
        isRelated: false
      })
    : {};

  delete action.config.assignedTo;

  if (!!config.customers) {
    relatedValueProps['customers'] = { key: '_id' };
    target.customers = config.customers;
  }
  if (!!config.companies) {
    relatedValueProps['companies'] = { key: '_id' };
    target.companies = config.companies;
  }

  newData = {
    ...newData,
    ...(await replacePlaceHolders({
      models,
      subdomain,
      getRelatedValue,
      actionData: action.config,
      target: {
        ...target,
        type: (triggerType || '').replace('tickets:', '')
      },
      relatedValueProps
    }))
  };

  if (execution.target.userId) {
    newData.userId = execution.target.userId;
  }

  if (execution.triggerType === 'inbox:conversation') {
    newData.sourceConversationIds = [execution.targetId];
  }

  if (
    ['core:customer', 'core:lead'].includes(execution.triggerType) &&
    execution.target.isFormSubmission
  ) {
    newData.sourceConversationIds = [execution.target.conversationId];
  }

  if (newData.hasOwnProperty('assignedTo')) {
    newData.assignedUserIds = newData.assignedTo.trim().split(', ');
  }

  if (newData.hasOwnProperty('labelIds')) {
    newData.labelIds = newData.labelIds.trim().split(', ');
  }

  if (newData.hasOwnProperty('cardName')) {
    newData.name = newData.cardName;
  }

  if (config.hasOwnProperty('stageId')) {
    newData.stageId = config.stageId;
  }

  if (!!newData?.customers) {
    newData.customerIds = generateIds(newData.customers);
  }
  if (!!newData?.companies) {
    newData.companyIds = generateIds(newData.companies);
  }

  if (Object.keys(newData).some((key) => key.startsWith('customFieldsData'))) {
    const customFieldsData: Array<{ field: string; value: string }> = [];

    const fieldKeys = Object.keys(newData).filter((key) =>
      key.startsWith('customFieldsData')
    );

    for (const fieldKey of fieldKeys) {
      const [, fieldId] = fieldKey.split('.');

      customFieldsData.push({
        field: fieldId,
        value: newData[fieldKey]
      });
    }
    newData.customFieldsData = customFieldsData;
  }

  if (newData.hasOwnProperty('attachments')) {
    const [serviceName] = triggerType.split(':');
    if (serviceName === 'tickets') {
      const item = await models.Tickets.findOne({ _id: target._id });
      newData.attachments = item.attachments;
    }
  }

  try {
    const { create } = getCollection(models, collectionType);

    const item = await itemsAdd(
      models,
      subdomain,
      newData,
      collectionType,
      create
    );

    if (execution.triggerType === 'inbox:conversation') {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: 'customer',
          mainTypeId: execution.target.customerId,
          relType: `${collectionType}`,
          relTypeId: item._id
        }
      });
    } else {
      const mainType = execution.triggerType.split(':')[1];

      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: mainType.replace('lead', 'customer'),
          mainTypeId: execution.targetId,
          relType: `${collectionType}`,
          relTypeId: item._id
        }
      });
    }

    return {
      name: item.name,
      itemId: item._id,
      stageId: item.stageId,
      pipelineId: newData.pipelineId,
      boardId: newData.boardId
    };
  } catch (e) {
    return { error: e.message };
  }
};

const generateIds = (value) => {
  const arr = value.split(', ');

  if (Array.isArray(arr)) {
    return arr;
  }

  if (!arr.match(/\{\{\s*([^}]+)\s*\}\}/g)) {
    return [arr];
  }

  return [];
};
