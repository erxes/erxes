let client;

export const initBroker = async cl => {
  client = cl;

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
