import { replacePlaceHolders, splitType } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getRelatedValue } from '~/modules/sales/meta/automations/action/getRelatedValue';
import { itemsAdd } from '~/modules/sales/utils';

export const actionCreate = async ({
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
  const { config = {} } = action;
  let { target, triggerType } = execution || {};
  let relatedValueProps = {};

  let newData = action.config.assignedTo
    ? await replacePlaceHolders({
      models,
      subdomain,
      customResolver: { resolver: getRelatedValue, isRelated: false },

      actionData: { assignedTo: action.config.assignedTo },
      target: { ...target, type: (triggerType || '').replace('sales:', '') },
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
      customResolver: { resolver: getRelatedValue, props: relatedValueProps },
      actionData: action.config,
      target: { ...target, type: (triggerType || '').replace('sales:', '') },
    })),
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
      key.startsWith('customFieldsData'),
    );

    for (const fieldKey of fieldKeys) {
      const [, fieldId] = fieldKey.split('.');

      customFieldsData.push({
        field: fieldId,
        value: newData[fieldKey],
      });
    }
    newData.customFieldsData = customFieldsData;
  }

  if (newData.hasOwnProperty('attachments')) {
    const [serviceName, itemType] = triggerType.split(':');
    if (serviceName === 'sales') {
      const item = await models.Deals.findOne({ _id: target._id });
      newData.attachments = item?.attachments;
    }
  }

  try {
    const item = await itemsAdd(
      models,
      subdomain,
      newData as any,
      collectionType,
      models.Deals.createDeal,
    );

    const [serviceName, mainType] = splitType(execution.triggerType);

    if (mainType === 'inbox:conversation') {
      await sendTRPCMessage({
        subdomain,
        method: 'mutation',
        pluginName: 'core',
        module: 'relation',
        action: 'createRelation',
        input: {
          entities: [{
            contentType: 'core:customer',
            contentId: execution.target.customerId,
          }, {
            contentType: 'sales:deal',
            contentId: item._id,
          }]
        },
      });
    } else if (serviceName !== 'sales') {
      await sendTRPCMessage({
        subdomain,
        method: 'mutation',
        pluginName: 'core',
        module: 'relation',
        action: 'createRelation',
        input: {
          entities: [{
            contentType: `core:${mainType.replace('lead', 'customer')}`,
            contentId: execution.targetId,
          }, {
            contentType: 'sales:deal',
            contentId: item._id,
          }]
        },
      });
    }

    return {
      name: item.name,
      targetId: item._id,
      stageId: item.stageId,
      pipelineId: newData.pipelineId,
      boardId: newData.boardId,
    };
  } catch (e) {
    throw e;
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
