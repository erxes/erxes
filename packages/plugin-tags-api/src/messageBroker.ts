import { generateModels } from './connectionResolver';
import {
  escapeRegExp,
  ISendMessageArgs,
  sendMessage
} from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('tags:find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Tags.find(data).lean(),
      status: 'success'
    };
  });

  consumeRPCQueue('tags:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Tags.findOne(data).lean(),
      status: 'success'
    };
  });

  consumeRPCQueue('tags:createTag', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tags.createTag(data)
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
          status: 'success'
        };
      }

      const orderQry: any[] = [];
      for (const tag of tags) {
        orderQry.push({
          order: { $regex: new RegExp(`^${tag.order}`) }
        });
      }

      return {
        data: await models.Tags.find(
          {
            $or: orderQry
          },
          fields || {}
        )
          .sort({ order: 1 })
          .lean(),
        status: 'success'
      };
    }
  );
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

export default function() {
  return client;
}
