import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue(
    'knowledgebase:topics.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.KnowledgeBaseTopics.findOne(query).lean()
      };
    }
  );

  consumeRPCQueue(
    'knowledgebase:topics.count',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.KnowledgeBaseTopics.find(query).count()
      };
    }
  );

  consumeRPCQueue(
    'knowledgebase:articles.find',
    async ({ subdomain, data: { query, sort } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.KnowledgeBaseArticles.find(query)
          .sort(sort)
          .lean()
      };
    }
  );

  consumeRPCQueue(
    'knowledgebase:categories.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.KnowledgeBaseCategories.findOne(query).lean()
      };
    }
  );
};

export const sendCoreMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
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

export default function() {
  return client;
}
