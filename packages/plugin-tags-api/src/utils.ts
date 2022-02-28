import { sendRPCMessage } from "./messageBroker";

export const countDocuments = async (type: string, _ids: string[], serviceDiscovery) => {
  const isServerAvailable = await serviceDiscovery.isAvailable(type);

  if(isServerAvailable) {
    return sendRPCMessage(`${type}:rpc_queue:tag`, { action: 'count', type, _ids })
  }

  return 0;
};

export const tagObject = async (type: string, tagIds: string[], targetIds: string[]) => {
  const [serviceName, contentType ] = type.split(':');

  return sendRPCMessage(`${serviceName}:rpc_queue:tag`, { action: 'tagObject', type: contentType, tagIds, targetIds })
};