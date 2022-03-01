import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';

import { serviceDiscovery } from './configs';
import { generateFields } from './fieldUtils';
import {
  generateAmounts,
  generateProducts
} from './graphql/resolvers/customResolvers/deal';
import { insertImportItems, prepareImportDocs } from './importUtils';
import { Checklists, Deals, GrowthHacks, Pipelines, Stages, Tasks, Tickets } from './models';
import { conversationConvertToCard } from './models/utils';
import {
  generateConditionStageIds,
  getContentItem,
  getContentTypeDetail,
  collectTasks,
  getCardContentIds,
  getCardItem
} from './utils';

import { LOG_MAPPINGS } from './constants';
import { notifiedUserIds } from './graphql/utils';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeRPCQueue('cards:rpc_queue:createTickets', async args => ({
    status: 'success',
    data: await Tickets.create(args)
  }));

  consumeRPCQueue('cards:rpc_queue:createTasks', async args => ({
    status: 'success',
    data: await Tasks.create(args)
  }));

  consumeRPCQueue('cards:rpc_queue:findTickets', async args => ({
    status: 'success',
    data: await Tickets.find(args)
  }));

  consumeRPCQueue('cards:rpc_queue:findOneTickets', async args => ({
    status: 'success',
    data: await Tickets.findOne(args)
  }));

  consumeRPCQueue('cards:rpc_queue:findStages', async args => ({
    status: 'success',
    data: await Stages.find(args)
  }));

  consumeRPCQueue('cards:rpc_queue:findTasks', async args => ({
    status: 'success',
    data: await Tasks.find(args)
  }));

  consumeRPCQueue('cards:rpc_queue:findOneTasks', async args => ({
    status: 'success',
    data: await Tasks.findOne(args)
  }));

  consumeQueue('checklists:removeChecklists', async ({ type, itemIds }) => ({
    status: 'success',
    data: await Checklists.removeChecklists(type, itemIds)
  }));

  consumeRPCQueue('cards:rpc_queue:getFields', async args => ({
    status: 'success',
    data: await generateFields(args)
  }));

  consumeRPCQueue('cards:rpc_queue:prepareImportDocs', async args => ({
    status: 'success',
    data: await prepareImportDocs(args)
  }));

  consumeRPCQueue('cards:rpc_queue:insertImportItems', async args => ({
    status: 'success',
    data: await insertImportItems(args)
  }));

  // listen for rpc queue =========
  consumeRPCQueue(
    'cards:segments:propertyConditionExtender',
    async ({ condition }) => {
      let positive;

      const stageIds = await generateConditionStageIds({
        boardId: condition.boardId,
        pipelineId: condition.pipelineId
      });

      if (stageIds.length > 0) {
        positive = {
          terms: {
            stageId: stageIds
          }
        };
      }

      return { data: { positive }, status: 'success' };
    }
  );

  consumeRPCQueue('cards:segments:associationTypes', async ({ mainType }) => {
    let types: string[] = [];

    if (mainType === 'deal') {
      types = ['customer', 'company', 'ticket', 'task'];
    }

    if (mainType === 'task') {
      types = ['customer', 'company', 'ticket', 'deal'];
    }

    if (mainType === 'ticket') {
      types = ['customer', 'company', 'deal', 'task'];
    }

    return { data: { types }, status: 'success' };
  });

  consumeRPCQueue('cards:segments:esTypesMap', async () => {
    return { data: { typesMap: {} }, status: 'success' };
  });

  consumeRPCQueue(
    'cards:segments:initialSelector',
    async ({ segment, options }) => {
      let positive;

      const stageIds = await generateConditionStageIds({
        boardId: segment.boardId,
        pipelineId: segment.pipelineId,
        options
      });

      if (stageIds.length > 0) {
        positive = { terms: { stageId: stageIds } };
      }

      return { data: { positive }, status: 'success' };
    }
  );

  consumeRPCQueue('cards:rpc_queue:conversationConvert', async args => ({
    status: 'success',
    data: await conversationConvertToCard(args)
  }));

  consumeRPCQueue('cards:rpc_queue:logs:getSchemaLabels', async ({ type }) => ({
    status: 'success',
    data: getSchemaLabels(type, LOG_MAPPINGS)
  }));

  consumeRPCQueue('cards:rpc_queue:getActivityContent', async data => {
    return {
      status: 'success',
      data: await getContentItem(data)
    };
  });

  consumeRPCQueue('cards:rpc_queue:getContentTypeDetail', async data => {
    const { activityLog = {} } = data;

    return {
      status: 'success',
      data: await getContentTypeDetail(activityLog)
    };
  });

  consumeRPCQueue(`cards:rpc_queue:activityLog:collectItems`, async data => ({
    status: 'success',
    data: await collectTasks(data)
  }));

  consumeRPCQueue('cards:rpc_queue:getCardContentIds', async data => ({
    status: 'success',
    data: await getCardContentIds(data)
  }));

  consumeRPCQueue('cards:deals:generateAmounts', async productsData => {
    return { data: generateAmounts(productsData), status: 'success' };
  });

  consumeRPCQueue('cards:deals:generateProducts', async productsData => {
    return { data: await generateProducts(productsData), status: 'success' };
  });

  consumeRPCQueue('cards:rpc_queue:findCardItem', async data => {
    return { data: await getCardItem(data), status: 'success' };
  });

  consumeRPCQueue('cards:rpc_queue:generateInteralNoteNotif', async args => {
    let model: any = GrowthHacks;

    const { contentTypeId, notifDoc, type } = args;

    if (type === 'growthHack') {
      const hack = await model.getGrowthHack(contentTypeId);

      notifDoc.content = `${hack.name}`;

      return notifDoc;
    }

    switch(type) {
      case 'deal': 
        model = Deals;
        break;
      case 'task':
        model = Tasks;
        break;
      default: 
        model = Tickets;
        break;
    }

     const card = await model.findOne({_id: contentTypeId });
     const stage = await Stages.getStage(card.stageId);
     const pipeline = await Pipelines.getPipeline(stage.pipelineId);

     notifDoc.notifType = `${type}Delete`;
     notifDoc.content = `"${card.name}"`;
     notifDoc.link = `/${type}/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${card._id}`;
     notifDoc.contentTypeId = card._id;
     notifDoc.contentType = `${type}`;
     notifDoc.item = card;
     
     // sendNotificationOfItems on ticket, task and deal
     notifDoc.notifOfItems = true;

    return {
      status: 'success',
      data: notifDoc
    }

  });

  consumeRPCQueue('cards:rpc_queue:notifiedUserIds', async args => {
    return { 
      status: 'success',
      data: await notifiedUserIds(args),
    };
  });
};

export const sendMessage = async (channel, message): Promise<any> => {
  return client.sendMessage(channel, message);
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const sendContactMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`contacts:${action}`, data);
};

export const sendContactRPCMessage = async (action, data): Promise<any> => {
  if (!(await serviceDiscovery.isEnabled('contacts'))) {
    return [];
  }

  if (!(await serviceDiscovery.isAvailable('contacts'))) {
    throw new Error("Contacts service is not available");
  }

  return client.sendRPCMessage(`contacts:rpc_queue:${action}`, data);
};

export const sendFormRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`forms:rpc_queue:${action}`, data);
};

export const sendFormMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`forms:${action}`, data);
};

export const sendInternalNoteMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`internalNotes:${action}`, data);
};

export const sendConformityMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`conformities:${action}`, data);
};

export const sendFieldsGroupMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`fieldsGroups:${action}`, data);
};

export const sendEngageRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`engages:rpc_queue:${action}`, data);
};

export const sendFieldRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`fields:rpc_queue:${action}`, data);
};

export const sendInboxRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`inbox:rpc_queue:${action}`, data);
};

export const findProducts = async (action, data): Promise<any> => {
  if (!(await serviceDiscovery.isEnabled('products'))) {
    return [];
  }

  if (!(await serviceDiscovery.isAvailable('products'))) {
    throw new Error("Products service is not available");
  }

  return client.sendRPCMessage(`products:rpc_queue:${action}`, data);
};

export const updateProducts = async (selector, modifier): Promise<any> => {
  return client.sendRPCMessage(`products:rpc_queue:update`, {
    selector,
    modifier
  });
};

export const sendProductRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`products:rpc_queue:${action}`, data);
};

export const sendConfigRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`configs:rpc_queue:${action}`, data);
};

export const sendNotificationMessage = async (
  action,
  data,
  isRPC?: boolean,
  defaultValue?
): Promise<any> => {
  if (!(await serviceDiscovery.isEnabled('notifications'))) {
    return defaultValue;
  }
  
  if (isRPC) {
    if (!(await serviceDiscovery.isAvailable('notifications'))) {
      throw new Error("Notifications service is not available");
    }
    return client.sendRPCMessage(`notifications:rpc_queue:${action}`, data);
  }

  return client.sendMessage(`notifications:${action}`, data);
};

export const sendToLog = (channel: string, data) =>
  client.sendMessage(channel, data);

export const fetchSegment = (segment, options?) =>
  sendRPCMessage('rpc_queue:fetchSegment', {
    segment,
    options
  });

export const findMongoDocuments = async (serviceName: string, data: any) => {
  if(!(await serviceDiscovery.isEnabled(serviceName))) {
    return [];
  }

  if(!(await serviceDiscovery.isAvailable(serviceName))) {
    throw new Error(`${serviceName} is not available`);
  }

  return client.sendRPCMessage(`${serviceName}:rpc_queue:findMongoDocuments`, data);
};

export default function() {
  return client;
}
