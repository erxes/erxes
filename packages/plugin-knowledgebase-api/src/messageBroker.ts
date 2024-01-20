import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

import { generateModels } from './connectionResolver';

export const initBroker = async () => {
  consumeRPCQueue(
    'knowledgebase:topics.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.KnowledgeBaseTopics.findOne(query).lean(),
      };
    },
  );

  consumeRPCQueue(
    'knowledgebase:topics.find',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.KnowledgeBaseTopics.find(query).lean(),
      };
    },
  );

  consumeRPCQueue(
    'knowledgebase:topics.count',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.KnowledgeBaseTopics.find(query).count(),
      };
    },
  );

  consumeRPCQueue(
    'knowledgebase:articles.find',
    async ({ subdomain, data: { query, sort } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.KnowledgeBaseArticles.find(query).sort(sort).lean(),
      };
    },
  );

  consumeRPCQueue(
    'knowledgebase:categories.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.KnowledgeBaseCategories.findOne(query).lean(),
      };
    },
  );
  consumeRPCQueue(
    'knowledgebase:categories.find',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.KnowledgeBaseCategories.find(query).lean(),
      };
    },
  );
};

export const sendCoreMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'segments',
    ...args,
  });
};
