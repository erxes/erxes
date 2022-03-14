import { fetchSegment, isInSegment } from "./graphql/resolvers/queries/queryBuilder";
import { Segments } from "./models";

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue('segments:rpc_queue:findOne', async (selector) => {
    const data = await Segments.findOne(selector);

    return { data, status: 'success' };
  });

  consumeRPCQueue('segments:rpc_queue:find', async (selector) => {
    const data = await Segments.find(selector);

    return { data, status: 'success' };
  });

  consumeRPCQueue('segments:rpc_queue:fetchSegment', async ({ segmentId, options }) => {
    const segment = await Segments.findOne({ _id: segmentId });
    const data = await fetchSegment(segment, options);

    return { data, status: 'success' };
  });

  consumeRPCQueue('segments:rpc_queue:isInSegment', async ({ segmentId, idToCheck, options }) => {
    const data = await isInSegment(segmentId, idToCheck, options);

    return { data, status: 'success' };
  });

  consumeQueue('segments:removeSegment', async ({ segmentId }) => ({
    status: 'success',
    data: await Segments.removeSegment(segmentId)
  }));
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const sendConformityMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`conformities.${action}`, data);
};

export default function() {
  return client;
}