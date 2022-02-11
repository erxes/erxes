import { InternalNotes } from "./models";
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue } = cl;

  consumeQueue('internalNotes:batchUpdate', async (contentType, oldContentTypeIds, newContentTypeId) => {
    // Updating every internal notes of company
    await InternalNotes.updateMany(
      {
        contentType,
        contentTypeId: { $in: oldContentTypeIds || [] }
      },
      { contentTypeId: newContentTypeId }
    );
  });
};

export const sendNotificationMessage = async (
  action,
  data,
  isRPC?: boolean,
  defaultValue?
): Promise<any> => {
  if (isRPC) {
    if (!await serviceDiscovery.isAvailable('notifications')) {
      return defaultValue;
    }

    return client.sendRPCMessage(`notifications:rpc_queue:${action}`, data);
  }

  return client.sendMessage(`notifications:${action}`, data);
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export default function() {
  return client;
}
