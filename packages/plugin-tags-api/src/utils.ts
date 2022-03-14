import { IContext } from './connectionResolver';
import { sendCommonMessage } from './messageBroker';

export const countDocuments = async (
  type: string,
  _ids: string[],
  serviceDiscovery,
  { subdomain }: IContext
) => {
  const [serviceName, contentType] = type.split(':');

  const isServerAvailable = await serviceDiscovery.isEnabled(serviceName);

  if (isServerAvailable) {
    return sendCommonMessage({
      subdomain,
      action: `${contentType}.tagCount`,
      serviceName,
      data: {
        type: contentType,
        _ids,
      },
    });
  }

  return 0;
};

export const tagObject = async (
  subdomain: string,
  type: string,
  tagIds: string[],
  targetIds: string[],
  serviceDiscovery
) => {
  const [serviceName, contentType] = type.split(':');

  const isServerAvailable = await serviceDiscovery.isEnabled(serviceName);

  if (isServerAvailable) {
    return sendCommonMessage({
      subdomain,
      serviceName,
      action: `${contentType}.tagObject`,
      data: {
        tagIds,
        targetIds,
      },
    });
  }

  return [];
};
