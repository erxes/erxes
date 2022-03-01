import { sendRPCMessage } from './messageBroker';

export const countDocuments = async (
  type: string,
  _ids: string[],
  serviceDiscovery
) => {
  const [serviceName, contentType] = type.split(':');

  const isServerAvailable = await serviceDiscovery.isEnabled(serviceName);

  if (isServerAvailable) {
    return sendRPCMessage(`${serviceName}:rpc_queue:tag`, {
      action: 'count',
      type: contentType,
      _ids
    });
  }

  return 0;
};

export const tagObject = async (
  type: string,
  tagIds: string[],
  targetIds: string[],
  serviceDiscovery
) => {
  const [serviceName, contentType] = type.split(':');

  const isServerAvailable = await serviceDiscovery.isEnabled(serviceName);

  if (isServerAvailable) {
    return sendRPCMessage(`${serviceName}:rpc_queue:tag`, {
      action: 'tagObject',
      type: contentType,
      tagIds,
      targetIds
    });
  }

  return [];
};
