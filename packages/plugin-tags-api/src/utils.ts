import { IContext } from './connectionResolver';
import { sendCommonMessage } from './messageBroker';

export const countDocuments = async (
  subdomain: string,
  type: string,
  _ids: string[],
) => {
  const [serviceName, contentType] = type.split(':');

  return sendCommonMessage({
    subdomain,
    action: `${contentType}.tagCount`,
    serviceName,
    data: {
      type: contentType,
      _ids,
    },
  });
};

export const tagObject = async (
  subdomain: string,
  type: string,
  tagIds: string[],
  targetIds: string[],
) => {
  const [serviceName, contentType] = type.split(':');

  return sendCommonMessage({
    subdomain,
    serviceName,
    action: `${contentType}.tagObject`,
    data: {
      tagIds,
      targetIds,
    },
  });
};