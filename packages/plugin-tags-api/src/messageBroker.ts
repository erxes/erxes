import { consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';
import { generateModels } from './connectionResolver';
import {
  escapeRegExp,
  MessageArgs,
  sendMessage,
} from '@erxes/api-utils/src/core';

export const setupMessageConsumers = async () => {
  consumeRPCQueue('tags:find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Tags.find(data).lean(),
      status: 'success',
    };
  });

  consumeRPCQueue('tags:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Tags.findOne(data).lean(),
      status: 'success',
    };
  });

  consumeRPCQueue('tags:createTag', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tags.createTag(data),
    };
  });

  consumeRPCQueue(
    'tags:withChilds',
    async ({ subdomain, data: { query, fields } }) => {
      const models = await generateModels(subdomain);

      const tags = await models.Tags.find(query);

      if (!tags.length) {
        return {
          data: [],
          status: 'success',
        };
      }

      const orderQry: any[] = [];
      for (const tag of tags) {
        orderQry.push({
          order: { $regex: new RegExp(`^${escapeRegExp(tag.order || '')}`) },
        });
      }

      return {
        data: await models.Tags.find(
          {
            $or: orderQry,
          },
          fields || {},
        )
          .sort({ order: 1 })
          .lean(),
        status: 'success',
      };
    },
  );
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
