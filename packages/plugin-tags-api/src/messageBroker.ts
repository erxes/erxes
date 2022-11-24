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
    'tags:getTagChildIds',
    async ({ subdomain, data: { parentId } }) => {
      const models = await generateModels(subdomain);

      const tag = await models.Tags.getTag(parentId);

      const tags =
        tag.order &&
        (await models.Tags.find({
          order: { $regex: new RegExp(escapeRegExp(tag.order), 'i') }
        }).lean());

      return {
        data: tags,
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
