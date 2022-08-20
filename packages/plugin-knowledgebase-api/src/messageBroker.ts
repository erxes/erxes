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
};

export const sendCoreMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export default function() {
  return client;
}
