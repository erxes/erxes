import * as models from "./models";
import { ITagDocument } from "./models/definitions/tags";

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('tags:rpc_queue:find', async (selector) => ({
    data: await models.Tags.find(selector).lean(),
    status: 'success',
  }));

  consumeRPCQueue('tags:rpc_queue:findOne', async (selector) => ({
    data: await Tags.findOne(selector).lean(),
    status: 'success',
  }));

  consumeRPCQueue('tags:rpc_queue:getActivityContent', async (data) => {
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

  consumeRPCQueue('core:rpc_queue:findMongoDocuments', async (data) => {
    const { query, name } = data;

    const collection = models[name];

    return {
      status: 'success',
      data: collection ? await collection.find(query) : null
    }
  });
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};
