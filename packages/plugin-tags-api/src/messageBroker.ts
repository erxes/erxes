import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';
import { generateModels } from './connectionResolver';

import { ITagDocument, tagSchema } from './models/definitions/tags';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('tags:rpc_queue:find', async ({ subdomain, selector }) => {
    const models = await generateModels(subdomain);
    return {
      data: await models.Tags.find(selector).lean(),
      status: 'success',
    };
  });

  consumeRPCQueue('tags:rpc_queue:findOne', async ({ subdomain, selector }) => {
    const models = await generateModels(subdomain);
    return {
      data: await models.Tags.findOne(selector).lean(),
      status: 'success',
    };
  });

  consumeRPCQueue(
    'tags:rpc_queue:getActivityContent',
    async ({ subdomain, data }) => {
      const { action, content } = data;
      const models = await generateModels(subdomain);
      if (action === 'tagged') {
        let tags: ITagDocument[] = [];

        if (content) {
          // tags = await getDocumentList('tags', { _id: { $in: content.tagIds } });
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

  consumeRPCQueue(
    'tags:rpc_queue:findMongoDocuments',
    async ({ subdomain, data }) => {
      const { query, name } = data;
      const models = await generateModels(subdomain);
      const collection = models[name];

      return {
        status: 'success',
        data: collection ? await collection.find(query) : [],
      };
    }
  );

  consumeRPCQueue('tags:rpc_queue:logs:getSchemaLabels', async ({ type }) => ({
    status: 'success',
    data: getSchemaLabels(type, [{ name: 'product', schemas: [tagSchema] }]),
  }));

  consumeRPCQueue('tags:createTag', async ({ subdomain, doc }) => {
    const models = await generateModels(subdomain);
    return {
      status: 'success',
      data: await models.Tags.createTag(doc),
    };
  });
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export default function() {
  return client;
}
