import { IModels } from './connectionResolver';
import {
  sendCardsMessage,
  sendCoreMessage,
  sendNotificationsMessage
} from './messageBroker';

function parseRequestParams(request: any) {
  return JSON.parse(request?.params || '{}');
}

async function getFilteredRequests(models: IModels, newData: any, contentType: string) {
  return await models.Requests.find({
    $and: [
      { params: { $regex: new RegExp(`.*"sourceStageId":"${newData.stageId}".*`) } },
      { params: { $regex: new RegExp(`.*"type":"${contentType}".*`) } }
    ]
  });
}

function extractIdsAndTypes(requests: any[]) {
  const itemIds: string[] = [];
  const sourceContentTypes: string[] = [];

  requests.forEach((request) => {
    const params = parseRequestParams(request);
    if (params.itemId && params.sourceType) {
      itemIds.push(params.itemId);
      sourceContentTypes.push(params.sourceType);
    }
  });

  return { itemIds, sourceContentTypes };
}

async function findConformities(subdomain: string, contentType: string, sourceContentTypes: string[], itemIds: string[]) {
  return await sendCoreMessage({
    subdomain,
    action: 'conformities.findConformities',
    data: {
      relType: contentType,
      mainType: { $in: sourceContentTypes },
      mainTypeId: { $in: itemIds }
    },
    isRPC: true,
    defaultValue: []
  });
}

async function handleConformity(conformity: any, models: IModels, subdomain: string, newData: any, user: any) {
  const receiverIds: string[] = [];
  const request = await models.Requests.findOne({
    contentType: conformity.mainType,
    contentTypeId: conformity.mainTypeId,
    status: 'approved'
  });
  
  if (request) {
    const { configs, itemId, sourceType } = parseRequestParams(request);

    for (const config of configs || []) {
      if (config.sourceStageId === newData.stageId) {
        await sendCardsMessage({
          subdomain,
          action: 'editItem',
          data: {
            itemId,
            type: sourceType,
            stageId: config.destinationStageId,
            processId: Math.random(),
            user
          }
        });
      }
    }
    
    if (request.requesterId) {
      receiverIds.push(request.requesterId);
    }
  }
  return receiverIds;
}

async function sendNotifications(subdomain: string, user: any, receiverIds: string[], name: string, _id: string, contentType: string, action: string) {
  const link = await sendCardsMessage({
    subdomain,
    action: 'getLink',
    data: { _id, type: contentType },
    isRPC: true,
    defaultValue: null
  });

  await sendNotificationsMessage({
    subdomain,
    action: 'send',
    data: {
      createdUser: user,
      receivers: receiverIds,
      title: `grant`,
      action: `changed stage of`,
      content: name,
      notifType: 'plugin',
      link: link
    }
  });

  await sendCoreMessage({
    subdomain: 'os',
    action: 'sendMobileNotification',
    data: {
      title: `Grant`,
      body: `${user?.details?.fullName || user?.details?.shortName} wants ${action}`,
      receivers: receiverIds,
      data: { _id, type: contentType }
    }
  });
}

export const afterMutationHandlers = async (
  models: IModels,
  subdomain: string,
  params: any
) => {
  const { type, action, user, newData, object: { _id, name } } = params;

  if (action !== 'update' || !type.includes('cards') || !newData.stageId) {
    return;
  }

  const contentType = type.replace('cards:', '');
  const requests = await getFilteredRequests(models, newData, contentType);

  if (requests.length) {
    const { itemIds, sourceContentTypes } = extractIdsAndTypes(requests);
    const conformities = await findConformities(subdomain, contentType, sourceContentTypes, itemIds);

    let allReceiverIds: string[] = [];

    for (const conformity of conformities) {
      const receiverIds = await handleConformity(conformity, models, subdomain, newData, user);
      allReceiverIds = allReceiverIds.concat(receiverIds);
    }

    if (allReceiverIds.length) {
      await sendNotifications(subdomain, user, allReceiverIds, name, _id, contentType, action);
    }
  }
};
