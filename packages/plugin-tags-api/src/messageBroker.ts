import { ACTIVITY_ACTIONS } from '@erxes/api-utils/src/constants';

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

  consumeRPCQueue('tags:rpc_queue:getActivityContent', async (data) => {
    const { action, content } = data;

    if (action === ACTIVITY_ACTIONS.TAGGED) {
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