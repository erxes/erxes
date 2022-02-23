import { Tags } from "./models";
import { ITagDocument } from "./models/definitions/tags";

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('tags:rpc_queue:find', async (selector) => ({
    data: await Tags.find(selector).lean(),
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
        tags = await Tags.find({ _id: { $in: content.tagIds } });
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
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};