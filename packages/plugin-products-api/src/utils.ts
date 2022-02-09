import { sendRPCMessage } from "./messageBroker";

export const countDocuments = async (type: string, _ids: string[]) => {
  const [serviceName, contentType ] = type.split(':');

  return sendRPCMessage(`${serviceName}:rpc_queue:tag`, { action: 'count', type: contentType, _ids })
};

export const tagObject = async (type: string, tagIds: string[], targetIds: string[]) => {
  const [serviceName, contentType ] = type.split(':');

  return sendRPCMessage(`${serviceName}:rpc_queue:tag`, { action: 'tagObject', type: contentType, tagIds, targetIds })
};