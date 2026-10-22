import {
  replaceOutputPlaceholders,
  splitType,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { itemsAdd, setDealContacts } from '~/modules/sales/utils';
import { syncWrittenDealPoints } from '~/modules/sales/utils/dealPoints';

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

  // A deal keeps one customer and one company: the first chosen.
  if (newData?.customers) {
    newData.customerId = generateIds(newData.customers)[0];
  }
  if (newData?.companies) {
    newData.companyId = generateIds(newData.companies)[0];
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

  // The contact the automation ran for becomes the deal's own contact.
  if (mainType === 'inbox:conversation') {
    await setDealContacts(models, {
      dealId: item._id,
      customerId: execution.target.customerId,
    });
  } else if (serviceName !== 'sales') {
    const contactType = mainType.replace('lead', 'customer');

    await setDealContacts(models, {
      dealId: item._id,
      customerId: contactType === 'customer' ? execution.targetId : undefined,
      companyId: contactType === 'company' ? execution.targetId : undefined,
    });
  }

  // After the contact: the customer it links is who earns.
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

const generateIds = (value: string | string[]) => {
  if (Array.isArray(value)) {
    return value;
  }

  return String(value).split(', ');
};
