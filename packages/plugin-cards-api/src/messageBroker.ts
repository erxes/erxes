import { sendToWebhook as sendWebhook } from '@erxes/api-utils/src';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { graphqlPubsub, serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';
import {
  generateAmounts,
  generateProducts
} from './graphql/resolvers/customResolvers/deal';
import { itemsEdit, publishHelper } from './graphql/resolvers/mutations/utils';
import { createConformity, notifiedUserIds } from './graphql/utils';
import { conversationConvertToCard, createBoardItem } from './models/utils';
import { getCardItem } from './utils';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeRPCQueue('cards:tickets.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const ticket = await models.Tickets.createTicket(data);

    const { customerId = '' } = data;

    if (customerId) {
      await createConformity(subdomain, {
        customerIds: [customerId],
        mainType: 'ticket',
        mainTypeId: ticket._id
      });
    }

    return {
      status: 'success',
      data: ticket
    };
  });

  consumeRPCQueue('cards:tasks.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const task = await models.Tasks.create(data);

    const { customerId = '' } = data;

    if (customerId) {
      await createConformity(subdomain, {
        customerIds: [customerId],
        mainType: 'task',
        mainTypeId: task._id
      });
    }

    return {
      status: 'success',
      data: task
    };
  });

  consumeRPCQueue('cards:purchases.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const purchases = await models.Purchases.create(data);

    const { customerId = '' } = data;

    if (customerId) {
      await createConformity(subdomain, {
        customerIds: [customerId],
        mainType: 'deal',
        mainTypeId: purchases._id
      });
    }
    return {
      status: 'success',
      data: purchases
    };
  });

  consumeRPCQueue('cards:editItem', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const objModels = {
      ticket: models.Tickets,
      task: models.Tasks,
      deal: models.Deals,
      purchase: models.Purchases
    };

    const { itemId, processId, type, user, ...doc } = data;

    if (!itemId || !type || !user || !processId) {
      return {
        status: 'failed',
        data: 'you must provide some params'
      };
    }
    const collection = objModels[type];

    const oldItem = await collection.findOne({ _id: itemId });
    const typeUpperCase = type.charAt(0).toUpperCase() + type.slice(1);

    return {
      status: 'success',
      data: await itemsEdit(
        models,
        subdomain,
        itemId,
        type,
        oldItem,
        doc,
        processId,
        user,
        collection[`update${typeUpperCase}`]
      )
    };
  });

  consumeRPCQueue('cards:createChildItem', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { type, itemId, ...doc } = data;

    const parent = await getCardItem(models, {
      contentType: type,
      contentTypeId: itemId
    });

    if (!parent) {
      return {
        status: 'failde',
        data: null
      };
    }

    const childCard = await createBoardItem(
      models,
      subdomain,
      { parentId: itemId, stageId: parent.stageId, ...doc },
      type
    );

    return {
      status: 'success',
      data: childCard
    };
  });

  consumeRPCQueue('cards:createRelatedItem', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { type, sourceType, itemId, name, stageId } = data;

    const relatedCard = await createBoardItem(
      models,
      subdomain,
      { name, stageId },
      type
    );

    await sendCoreMessage({
      subdomain,
      action: 'conformities.addConformity',
      data: {
        mainType: sourceType,
        mainTypeId: itemId,
        relType: type,
        relTypeId: relatedCard._id
      }
    });

    return {
      status: 'success',
      data: relatedCard
    };
  });

  consumeRPCQueue(
    'cards:tasks.remove',
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Tasks.removeTasks(_ids)
      };
    }
  );

  consumeRPCQueue('cards:deals.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const deals = await models.Deals.create(data);

    const { customerId = '' } = data;

    if (customerId) {
      await createConformity(subdomain, {
        customerIds: [customerId],
        mainType: 'deal',
        mainTypeId: deals._id
      });
    }
    return {
      status: 'success',
      data: deals
    };
  });

  consumeRPCQueue(
    'cards:deals.remove',
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Deals.removeDeals(_ids)
      };
    }
  );

  consumeRPCQueue(
    'cards:purchases.remove',
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Purchases.removePurchases(_ids)
      };
    }
  );

  consumeRPCQueue('cards:tickets.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    if (!data.query) {
      return {
        status: 'success',
        data: await models.Tickets.find(data).lean()
      };
    }

    const { query, sort = {} } = data;

    return {
      status: 'success',
      data: await models.Tickets.find(query)
        .sort(sort)
        .lean()
    };
  });

  consumeRPCQueue('cards:tickets.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tickets.findOne(data).lean()
    };
  });

  consumeRPCQueue(
    'cards:tickets.remove',
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Tickets.removeTickets(_ids)
      };
    }
  );

  consumeRPCQueue('cards:stages.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Stages.find(data)
        .sort({ order: 1 })
        .lean()
    };
  });

  consumeRPCQueue('cards:stages.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Stages.findOne(data).lean()
    };
  });

  consumeRPCQueue('cards:tasks.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tasks.find(data).lean()
    };
  });

  consumeRPCQueue('cards:tasks.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tasks.findOne(data).lean()
    };
  });

  consumeRPCQueue('cards:pipelines.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Pipelines.find(data).lean()
    };
  });

  consumeRPCQueue('cards:boards.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Boards.find(data).lean()
    };
  });

  consumeRPCQueue(
    'cards:boards.count',
    async ({ subdomain, data: { selector } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Boards.find(selector).count()
      };
    }
  );

  consumeRPCQueue(
    'cards:growthHacks.count',
    async ({ subdomain, data: { selector } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.GrowthHacks.count(selector)
      };
    }
  );

  consumeQueue(
    'cards:checklists.removeChecklists',
    async ({ subdomain, data: { type, itemIds } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Checklists.removeChecklists(type, itemIds)
      };
    }
  );

  consumeRPCQueue('cards:conversationConvert', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await conversationConvertToCard(models, subdomain, data)
    };
  });

  consumeRPCQueue('cards:deals.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    if (!data.query) {
      return {
        status: 'success',
        data: await models.Deals.find(data).lean()
      };
    }

    const { query, skip, limit, sort = {} } = data;

    return {
      status: 'success',
      data: await models.Deals.find(query)
        .skip(skip || 0)
        .limit(limit || 20)
        .sort(sort)
        .lean()
    };
  });

  consumeRPCQueue('cards:purchases.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    if (!data.query) {
      return {
        status: 'success',
        data: await models.Purchases.find(data).lean()
      };
    }

    const { query, skip, limit, sort = {} } = data;

    return {
      status: 'success',
      data: await models.Purchases.find(query)
        .skip(skip || 0)
        .limit(limit || 20)
        .sort(sort)
        .lean()
    };
  });

  consumeRPCQueue('cards:deals.count', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Deals.find(data).count()
    };
  });

  consumeRPCQueue('cards:purchases.count', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Purchases.find(data).count()
    };
  });

  consumeRPCQueue('cards:deals.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Deals.findOne(data).lean()
    };
  });

  consumeRPCQueue('cards:purchases.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Purchases.findOne(data).lean()
    };
  });

  consumeRPCQueue('cards:deals.generateAmounts', async productsData => {
    return { data: generateAmounts(productsData), status: 'success' };
  });

  consumeRPCQueue('cards:purchases.generateAmounts', async productsData => {
    return { data: generateAmounts(productsData), status: 'success' };
  });

  consumeRPCQueue(
    'cards:deals.generateProducts',
    async ({ subdomain, data }) => {
      return {
        data: await generateProducts(subdomain, data),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'cards:purchases.generateProducts',
    async ({ subdomain, data }) => {
      return {
        data: await generateProducts(subdomain, data),
        status: 'success'
      };
    }
  );

  consumeRPCQueue('cards:findItem', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return { data: await getCardItem(models, data), status: 'success' };
  });

  consumeRPCQueue(
    'cards:findDealProductIds',
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      const dealProductIds = await await models.Deals.find({
        'productsData.productId': { $in: _ids }
      }).distinct('productsData.productId');

      return { data: dealProductIds, status: 'success' };
    }
  );

  consumeRPCQueue(
    'cards:findPurchaseProductIds',
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      const purchaseProductIds = await await models.Purchases.find({
        'productsData.productId': { $in: _ids }
      }).distinct('productsData.productId');

      return { data: purchaseProductIds, status: 'success' };
    }
  );

  consumeRPCQueue(
    'cards:tickets.updateMany',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Tickets.updateMany(selector, modifier),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'cards:tasks.updateMany',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Tasks.updateMany(selector, modifier),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'cards:deals.updateMany',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Deals.updateMany(selector, modifier),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'cards:purchases.updateMany',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Purchases.updateMany(selector, modifier),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'cards:deals.updateOne',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Deals.updateOne(selector, modifier),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'cards:purchases.updateOne',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Purchases.updateOne(selector, modifier),
        status: 'success'
      };
    }
  );

  consumeRPCQueue('cards:notifiedUserIds', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await notifiedUserIds(models, data)
    };
  });

  consumeRPCQueue(
    'cards:getLink',
    async ({ subdomain, data: { _id, type } }) => {
      const models = await generateModels(subdomain);

      const item = await getCardItem(models, {
        contentTypeId: _id,
        contentType: type
      });

      if (!item) {
        return '';
      }

      const stage = await models.Stages.getStage(item.stageId);
      const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
      const board = await models.Boards.getBoard(pipeline.boardId);

      return {
        status: 'success',
        data: `/${stage.type}/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${_id}`
      };
    }
  );

  consumeQueue(
    'cards:pipelinesChanged',
    async ({ subdomain, data: { pipelineId, action, data } }) => {
      graphqlPubsub.publish('pipelinesChanged', {
        pipelinesChanged: {
          _id: pipelineId,
          proccessId: Math.random(),
          action,
          data
        }
      });

      return {
        status: 'success'
      };
    }
  );

  consumeQueue(
    'cards:productsDataChanged',
    async ({
      subdomain,
      data: { dealId, action, dataId, doc, productsData }
    }) => {
      graphqlPubsub.publish('productsDataChanged', {
        pipelinesChanged: {
          _id: dealId,
          proccessId: Math.random(),
          action,
          data: {
            dataId,
            doc,
            productsData
          }
        }
      });

      return {
        status: 'success'
      };
    }
  );

  consumeQueue(
    'cards:publishHelperItems',
    async ({ subdomain, data: { addedTypeIds, removedTypeIds, doc } }) => {
      const targetTypes = ['deal', 'task', 'ticket', 'purchase'];
      const targetRelTypes = ['company', 'customer'];

      if (
        targetTypes.includes(doc.mainType) &&
        targetRelTypes.includes(doc.relType)
      ) {
        await publishHelper(subdomain, doc.mainType, doc.mainTypeId);
      }

      if (
        targetTypes.includes(doc.relType) &&
        targetRelTypes.includes(doc.mainType)
      ) {
        for (const typeId of addedTypeIds.concat(removedTypeIds)) {
          await publishHelper(subdomain, doc.relType, typeId);
        }
      }

      return {
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'cards:getModuleRelation',
    async ({ subdomain, data: { module, target, triggerType } }) => {
      let filter;

      if (module.includes('contacts')) {
        const relTypeIds = await sendCommonMessage({
          subdomain,
          serviceName: 'core',
          action: 'conformities.savedConformity',
          data: {
            mainType: triggerType.split(':')[1],
            mainTypeId: target._id,
            relTypes: [module.split(':')[1]]
          },
          isRPC: true,
          defaultValue: []
        });

        if (relTypeIds.length) {
          filter = { _id: { $in: relTypeIds } };
        }
      }

      return {
        status: 'success',
        data: filter
      };
    }
  );
};

export const sendContactsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendInternalNotesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'internalNotes',
    ...args
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export const sendFormsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'forms',
    ...args
  });
};

export const sendEngagesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'engages',
    ...args
  });
};

export const sendInboxMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'inbox',
    ...args
  });
};

export const sendProductsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'products',
    ...args
  });
};

export const sendNotificationsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'notifications',
    ...args
  });
};

export const sendLogsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'logs',
    ...args
  });
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'segments',
    ...args
  });
};

export const sendLoyaltiesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'loyalties',
    ...args
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export const fetchSegment = (
  subdomain: string,
  segmentId: string,
  options?,
  segmentData?: any
) =>
  sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: { segmentId, options, segmentData },
    isRPC: true
  });

export const sendToWebhook = ({ subdomain, data }) => {
  return sendWebhook(client, { subdomain, data });
};

export const sendTagsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'tags',
    ...args
  });
};

export default function() {
  return client;
}
