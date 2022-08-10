import { graphqlPubsub, serviceDiscovery } from './configs';
import {
  generateAmounts,
  generateProducts
} from './graphql/resolvers/customResolvers/deal';
import { conversationConvertToCard } from './models/utils';
import { getCardItem } from './utils';
import { notifiedUserIds } from './graphql/utils';
import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { publishHelper } from './graphql/resolvers/mutations/utils';
import { sendToWebhook as sendWebhook } from '@erxes/api-utils/src';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeRPCQueue('cards:tickets.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tickets.create(data)
    };
  });

  consumeRPCQueue('cards:tasks.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tasks.create(data)
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

    return {
      status: 'success',
      data: await models.Deals.create(data)
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

  consumeRPCQueue('cards:tickets.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tickets.find(data).lean()
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
      data: await models.Stages.find(data).lean()
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

  consumeRPCQueue('cards:deals.count', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Deals.find(data).count()
    };
  });

  consumeRPCQueue('cards:deals.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Deals.findOne(data).lean()
    };
  });

  consumeRPCQueue('cards:deals.generateAmounts', async productsData => {
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
    'cards:deals.updateOne',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Deals.updateOne(selector, modifier),
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
      const models = await generateModels(subdomain);

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
    'cards:publishHelperItems',
    async ({ subdomain, data: { addedTypeIds, removedTypeIds, doc } }) => {
      const targetTypes = ['deal', 'task', 'ticket'];
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

export const fetchSegment = (subdomain: string, segmentId: string, options?) =>
  sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: { segmentId, options },
    isRPC: true
  });

export const sendToWebhook = ({ subdomain, data }) => {
  return sendWebhook(client, { subdomain, data });
};

export default function() {
  return client;
}
