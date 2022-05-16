import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';

const checkService = async (serviceName: string, needsList?: boolean) => {
  const enabled = await serviceDiscovery.isEnabled(serviceName);

  if (!enabled) {
    return needsList ? [] : null;
  }

  return;
};

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = cl;

  consumeQueue(
    'internalnotes:batchUpdate',
    async ({
      subdomain,
      data: { contentType, oldContentTypeIds, newContentTypeId }
    }) => {
      const models = await generateModels(subdomain);
      // Updating every internal notes of company
      await models.InternalNotes.updateMany(
        {
          contentType,
          contentTypeId: { $in: oldContentTypeIds || [] }
        },
        { contentTypeId: newContentTypeId }
      );
    }
  );

  consumeQueue(
    'internalnotes:removeInternalNotes',
    async ({ subdomain, data: { contentType, contentTypeIds } }) => {
      const models = await generateModels(subdomain);
      models.InternalNotes.removeInternalNotes(contentType, contentTypeIds);
    }
  );
};

export const sendNotificationsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'notifications',
    ...args
  });
};

export const sendCardsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'cards',
    ...args
  });
};

export const sendContactsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export const sendProductsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'products',
    ...args
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    ...args
  });
};

export const getContentIds = async (subdomain: string, data) => {
  const [serviceName] = data.contentType.split(':');

  await checkService(serviceName, true);

  return sendCommonMessage({
    subdomain,
    serviceName,
    action: 'logs:getContentIds',
    data,
    isRPC: true
  });
};

export default function() {
  return client;
}
