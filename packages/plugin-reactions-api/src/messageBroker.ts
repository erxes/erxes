import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage,
} from '@erxes/api-utils/src/core';

import { generateModels } from './connectionResolver';
import { consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';

export const setupMessageConsumers = async () => {
  consumeRPCQueue('reactions:comments.count', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Comments.find(data).countDocuments(),
    };
  });

  consumeRPCQueue(
    'reactions:emojies.likeCount',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Emojis.find(data).countDocuments(),
      };
    }
  );

  consumeRPCQueue(
    'reactions:emojies.heartCount',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Emojis.find(data).countDocuments(),
      };
    }
  );

  consumeRPCQueue(
    'reactions:emojies.isHearted',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: (await models.Emojis.countDocuments(data)) > 0 ? true : false,
      };
    }
  );

  consumeRPCQueue('reactions:emojies.isLiked', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: (await models.Emojis.countDocuments(data)) > 0 ? true : false,
    };
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
