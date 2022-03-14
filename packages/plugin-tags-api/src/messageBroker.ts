import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';
import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

import { ITagDocument, tagSchema } from './models/definitions/tags';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeRPCQueue } = client;

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

  consumeRPCQueue(
    'tags:logs.getActivityContent',
    async ({ subdomain, data }) => {
      const { action, content } = data;
      const models = await generateModels(subdomain);

      if (action === 'tagged') {
        let tags: ITagDocument[] = [];

        if (content) {
          tags = await models.Tags.find({ _id: { $in: content.tagIds } });
        }

        return {
          data: tags,
          status: 'success',
        };
      }

      return {
        status: 'error',
        data: 'wrong action',
      };
    }
  );

  consumeRPCQueue('tags:findMongoDocuments', async ({ subdomain, data }) => {
    const { query, name } = data;
    const models = await generateModels(subdomain);

    const collection = models[name];

    return {
      status: 'success',
      data: collection ? await collection.find(query) : [],
    };
  });

  consumeRPCQueue('tags:logs.getSchemaLabels', async ({ type }) => ({
    status: 'success',
    data: getSchemaLabels(type, [{ name: 'product', schemas: [tagSchema] }]),
  }));

  consumeRPCQueue('tags:createTag', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tags.createTag(data),
    };
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args,
  });
};

export default function() {
  return client;
}
