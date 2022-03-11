import { serviceDiscovery } from './configs';
import {
  generateAmounts,
  generateProducts
} from './graphql/resolvers/customResolvers/deal';
import { conversationConvertToCard } from './models/utils';
import { getCardItem } from './utils';
import { notifiedUserIds } from './graphql/utils';
import { generateModels } from './connectionResolver';
import { sendMessage } from '@erxes/api-utils/src/core';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeRPCQueue('cards:createTickets', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tickets.create(data)
    }
  });

  consumeRPCQueue('cards:createTasks', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tasks.create(data)
    }
  });

  consumeRPCQueue('cards:findTickets', async ({ subdomain, data })=> {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tickets.find(data)
    }
  });

  consumeRPCQueue('cards:findOneTickets', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tickets.findOne(data)
    }
  });

  consumeRPCQueue('cards:findStages', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Stages.find(data)
    }
  });

  consumeRPCQueue('cards:findTasks', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tasks.find(data)
    }
  });

  consumeRPCQueue('cards:findOneTasks', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tasks.findOne(data)
    }
  });

  consumeQueue('checklists:removeChecklists', async ({ subdomain, data: { type, itemIds } }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Checklists.removeChecklists(type, itemIds)
    }
  });

  consumeRPCQueue('cards:conversationConvert', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await conversationConvertToCard(models, data)
    }
  });

  consumeRPCQueue('cards:deals:generateAmounts', async productsData => {
    return { data: generateAmounts(productsData), status: 'success' };
  });

  consumeRPCQueue('cards:deals:generateProducts', async productsData => {
    return { data: await generateProducts(productsData), status: 'success' };
  });

  consumeRPCQueue('cards:findItem', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return { data: await getCardItem(models, data), status: 'success' };
  });

  consumeRPCQueue('cards:findDealProductIds', async ({ subdomain, data: { _ids } }) => {
    const models = await generateModels(subdomain);

    const dealProductIds = await await models.Deals.find({
      'productsData.productId': { $in: _ids }
    }).distinct('productsData.productId');

    return { data: dealProductIds, status: 'success' };
  });

  consumeRPCQueue('cards:updateDeals', async ({ subdomain, data: { selector, modifier } }) => {
    const models = await generateModels(subdomain);

    return { data: await models.Deals.updateMany(selector, modifier), status: 'success' };
  });

  consumeRPCQueue('cards:generateInternalNoteNotif', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    let model: any = models.GrowthHacks;

    const { contentTypeId, notifDoc, type } = data;

    if (type === 'growthHack') {
      const hack = await model.getGrowthHack(contentTypeId);

      notifDoc.content = `${hack.name}`;

      return notifDoc;
    }

    switch (type) {
      case 'deal':
        model = models.Deals;
        break;
      case 'task':
        model = models.Tasks;
        break;
      default:
        model = models.Tickets;
        break;
    }

    const card = await model.findOne({ _id: contentTypeId });
    const stage = await models.Stages.getStage(card.stageId);
    const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

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
    };
  });

  consumeRPCQueue('cards:notifiedUserIds', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await notifiedUserIds(models, data)
    };
  });
};

export const sendContactsMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'contacts', action, data, isRPC, defaultValue);
};

export const sendInternalNotesMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'internalNotes', action, data, isRPC, defaultValue);
};

export const sendCoreMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'core', action, data, isRPC, defaultValue);
};

export const sendFormsMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'forms', action, data, isRPC, defaultValue);
};

export const sendEngagesMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'engages', action, data, isRPC, defaultValue);
};

export const sendInboxMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'inbox', action, data, isRPC, defaultValue);
};

export const sendProductsMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'products', action, data, isRPC, defaultValue);
};

export const sendNotificationsMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'notifications', action, data, isRPC, defaultValue);
};

export const sendLogsMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'logs', action, data, isRPC, defaultValue);
};

export const sendSegmentsMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'segments', action, data, isRPC, defaultValue);
};

export const fetchSegment = (segment, options?) => sendSegmentsMessage('fetchSegment', { segment, options }, true);

export default function() {
  return client;
}
