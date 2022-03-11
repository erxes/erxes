import { serviceDiscovery } from './configs';
import {
  generateAmounts,
  generateProducts
} from './graphql/resolvers/customResolvers/deal';
import { conversationConvertToCard } from './models/utils';
import { getCardItem } from './utils';
import { notifiedUserIds } from './graphql/utils';
import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeRPCQueue('cards:tickets:create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tickets.create(data)
    }
  });

  consumeRPCQueue('cards:tasks:create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tasks.create(data)
    }
  });

  consumeRPCQueue('cards:tickets:find', async ({ subdomain, data })=> {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tickets.find(data)
    }
  });

  consumeRPCQueue('cards:tickets:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tickets.findOne(data)
    }
  });

  consumeRPCQueue('cards:stages:find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Stages.find(data)
    }
  });

  consumeRPCQueue('cards:tasks:find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tasks.find(data)
    }
  });

  consumeRPCQueue('cards:tasks:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tasks.findOne(data)
    }
  });

  consumeQueue('cards:checklists:removeChecklists', async ({ subdomain, data: { type, itemIds } }) => {
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
      data: await conversationConvertToCard(models, subdomain, data)
    }
  });

  consumeRPCQueue('cards:deals:generateAmounts', async productsData => {
    return { data: generateAmounts(productsData), status: 'success' };
  });

  consumeRPCQueue('cards:deals:generateProducts', async ({ subdomain, data }) => {
    return { data: await generateProducts(subdomain, data), status: 'success' };
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

  consumeRPCQueue('cards:deals:updateMany', async ({ subdomain, data: { selector, modifier } }) => {
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

export const sendContactsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'contacts', ...args });
};

export const sendInternalNotesMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'internalNotes', ...args });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'core', ...args });
};

export const sendFormsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'forms', ...args });
};

export const sendEngagesMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'engages', ...args });
};

export const sendInboxMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'inbox', ...args });
};

export const sendProductsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'products', ...args });
};

export const sendNotificationsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'notifications', ...args });
};

export const sendLogsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'logs', ...args });
};

export const sendSegmentsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'segments', ...args });
};

export const fetchSegment = (subdomain: string, segment, options?) => sendSegmentsMessage({ subdomain, action: 'fetchSegment', data: { segment, options }, isRPC: true });

export default function() {
  return client;
}