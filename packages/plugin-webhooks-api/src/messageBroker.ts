import { generateModels } from './connectionResolver';
import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { send } from './utils';

export const initBroker = async () => {
  consumeQueue('webhooks:send', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await send(models, subdomain, data),
    };
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string },
) => {
  return sendMessage({
    ...args,
  });
};
