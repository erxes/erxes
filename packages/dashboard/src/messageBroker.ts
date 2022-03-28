import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';

let client;

export const initBroker = async options => {
  client = await initBrokerCore(options);

  return client;
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const fetchSegment = (segmentId, options?) =>
  sendRPCMessage('segments:rpc_queue:fetchSegment', {
    segmentId,
    options
  });

export const getFileUploadConfigs = async () =>
  sendRPCMessage('core:getFileUploadConfigs', {});

export default function() {
  return client;
}
