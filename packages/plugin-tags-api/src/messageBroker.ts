import { getSchemaLabels } from "@erxes/api-utils/src/logUtils";

import * as models from "./models";
import { ITagDocument, tagSchema } from "./models/definitions/tags";

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('tags:rpc_queue:find', async (selector) => ({
    data: await models.Tags.find(selector).lean(),
    status: 'success',
  }));

  consumeRPCQueue('tags:rpc_queue:findOne', async (selector) => ({
    data: await models.Tags.findOne(selector).lean(),
    status: 'success',
  }));

  consumeRPCQueue('tags:logs:getActivityContent', async (data) => {
    const { action, content } = data;

    if (action === 'tagged') {
      let tags: ITagDocument[] = [];

      if (content) {
        // tags = await getDocumentList('tags', { _id: { $in: content.tagIds } });
        tags = await models.Tags.find({ _id: { $in: content.tagIds } });
      }

      return {
        data: tags,
        status: 'success'
      };
    }

    return {
      status: 'error',
      data: 'wrong action'
    }
  });

  consumeRPCQueue('tags:rpc_queue:findMongoDocuments', async (data) => {
    const { query, name } = data;

    const collection = models[name];

    return {
      status: 'success',
      data: collection ? await collection.find(query) : []
    }
  });

  consumeRPCQueue('tags:rpc_queue:logs:getSchemaLabels', async ({ type }) => ({
    status: 'success',
    data: getSchemaLabels(type, [{ name: 'product', schemas: [tagSchema] }])
  }));

  consumeRPCQueue('tags:createTag', async (doc) => ({
    status: 'success',
    data: await models.Tags.createTag(doc)
  }));
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export default function() {
  return client;
}
