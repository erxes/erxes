import { sendCommonMessage } from './messageBroker';

export const countDocuments = async (
  subdomain: string,
  type: string,
  _ids: string[]
) => {
  const [serviceName, contentType] = type.split(':');

  return sendCommonMessage({
    subdomain,
    action: 'tag',
    serviceName,
    data: {
      type: contentType,
      _ids,
      action: 'count'
    },
    isRPC: true
  });
};

export const tagObject = async (
  subdomain: string,
  type: string,
  tagIds: string[],
  targetIds: string[]
) => {
  const [serviceName, contentType] = type.split(':');

  return sendCommonMessage({
    subdomain,
    serviceName,
    action: 'tag',
    data: {
      tagIds,
      targetIds,
      type: contentType,
      action: 'tagObject'
    },
    isRPC: true
  });
};

export const fixRelatedItems = async ({
  subdomain,
  type,
  sourceId,
  destId,
  action
}: {
  subdomain: string;
  type: string;
  sourceId: string;
  destId?: string;
  action: string;
}) => {
  const [serviceName, contentType] = type.split(':');

  sendCommonMessage({
    subdomain,
    serviceName,
    action: 'fixRelatedItems',
    data: {
      sourceId,
      destId,
      type: contentType,
      action
    }
  });
};
