import { generateModels } from './connectionResolver';
import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { send } from './utils';
import { consumeQueue } from '@erxes/api-utils/src/messageBroker';

export const setupMessageConsumers = async () => {
  consumeQueue('webhooks:send', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await send(models, subdomain, data),
    };
  });
};

export const sendCommonMessage = async (args: MessageArgs) => {
  return sendMessage({
    ...args,
  });
};
