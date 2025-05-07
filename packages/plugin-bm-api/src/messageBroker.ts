import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';
import type { MessageArgsOmitService } from '@erxes/api-utils/src/core';
import { sendMessage } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';

export const setupMessageConsumers = async () => {
  consumeQueue('bm:send', async ({ data }) => {
    return {
      status: 'success',
    };
  });

  consumeRPCQueue('bm:find', async ({ data }) => {
    return {
      status: 'success',
      data: 'asd',
    };
  });

  consumeRPCQueue('bm:branch.count', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const count = await models.BmsBranch.countDocuments();

    return {
      status: 'success',
      data: count,
    };
  });
};

export const sendCoreMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};
