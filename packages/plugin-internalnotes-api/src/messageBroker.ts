import { InternalNotes } from "./models";

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

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};