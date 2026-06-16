import {
  replaceOutputPlaceholders,
  splitType,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
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
  const { target, triggerType } = execution || {};

  let newData: Record<string, any> = action.config.assignedTo
    ? await replaceOutputPlaceholders({
        subdomain,
        execution,
        values: { assignedTo: action.config.assignedTo },
      })
    : {};

  delete action.config.assignedTo;

  newData = {
    ...newData,
    ...(await replaceOutputPlaceholders({
      subdomain,
      execution,
      values: action.config,
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

  if (Object.prototype.hasOwnProperty.call(newData, 'assignedTo')) {
    newData.assignedUserIds = newData.assignedTo.trim().split(', ');
  }

  if (Object.prototype.hasOwnProperty.call(newData, 'labelIds')) {
    newData.labelIds = newData.labelIds.trim().split(', ');
  }

  if (Object.prototype.hasOwnProperty.call(newData, 'cardName')) {
    newData.name = newData.cardName;
  }

  if (Object.prototype.hasOwnProperty.call(config, 'stageId')) {
    newData.stageId = config.stageId;
  }

  if (newData?.customers) {
    newData.customerIds = generateIds(newData.customers);
  }
  if (newData?.companies) {
    newData.companyIds = generateIds(newData.companies);
  }

  if (Object.keys(newData).some((key) => key.startsWith('propertiesData.'))) {
    const propertiesData =
      newData.propertiesData &&
      !Array.isArray(newData.propertiesData) &&
      typeof newData.propertiesData === 'object'
        ? { ...newData.propertiesData }
        : {};

    const fieldKeys = Object.keys(newData).filter((key) =>
      key.startsWith('propertiesData.'),
    );

    for (const fieldKey of fieldKeys) {
      const fieldId = fieldKey.replace('propertiesData.', '');
      propertiesData[fieldId] = newData[fieldKey];
      delete newData[fieldKey];
    }
    newData.propertiesData = propertiesData;
  }

  if (Object.prototype.hasOwnProperty.call(newData, 'attachments')) {
    const [serviceName] = triggerType.split(':');
    if (serviceName === 'sales') {
      const item = await models.Deals.findOne({ _id: target._id });
      newData.attachments = item?.attachments;
    }
  }

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
        entities: [
          {
            contentType: 'core:customer',
            contentId: execution.target.customerId,
          },
          {
            contentType: 'sales:deal',
            contentId: item._id,
          },
        ],
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
        entities: [
          {
            contentType: `core:${mainType.replace('lead', 'customer')}`,
            contentId: execution.targetId,
          },
          {
            contentType: 'sales:deal',
            contentId: item._id,
          },
        ],
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
};

const generateIds = (value: string | string[]) => {
  if (Array.isArray(value)) {
    return value;
  }

  return String(value).split(', ');
};
