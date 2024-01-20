import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgs,
  MessageArgsOmitService,
} from '@erxes/api-utils/src/core';

import { generateModels } from './connectionResolver';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { consumeQueue } from '@erxes/api-utils/src/messageBroker';

const checkService = async (serviceName: string, needsList?: boolean) => {
  const enabled = await isEnabled(serviceName);

  if (!enabled) {
    return needsList ? [] : null;
  }

  return;
};

export const initBroker = async () => {
  consumeQueue(
    'internalnotes:batchUpdate',
    async ({
      subdomain,
      data: { contentType, oldContentTypeIds, newContentTypeId },
    }) => {
      const models = await generateModels(subdomain);
      // Updating every internal notes of company
      await models.InternalNotes.updateMany(
        {
          contentType,
          contentTypeId: { $in: oldContentTypeIds || [] },
        },
        { contentTypeId: newContentTypeId },
      );
    },
  );

  consumeQueue(
    'internalnotes:removeInternalNotes',
    async ({ subdomain, data: { contentType, contentTypeIds } }) => {
      const models = await generateModels(subdomain);
      models.InternalNotes.removeInternalNotes(contentType, contentTypeIds);
    },
  );
};

export const sendNotificationsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'notifications',
    ...args,
  });
};

export const sendCardsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args,
  });
};

export const sendContactsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendProductsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'products',
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
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
    isRPC: true,
  });
};
