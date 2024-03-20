import {
  MessageArgs,
  sendMessage
} from '@erxes/api-utils/src/core';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';
import { afterMutationHandlers } from './afterMutations';
import { generateModels } from './connectionResolver';

export const setupMessageConsumers = async () => {
  consumeQueue('bid:send', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    models.Polarissyncs.send(data);

    return {
      status: 'success',
    };
  });

  consumeQueue('bid:afterMutation', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    await afterMutationHandlers(models, subdomain, data);
    return;
  });

  consumeRPCQueue('bid:find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      status: 'success',
      data: await models.Polarissyncs.find({}),
    };
  });
};

export const sendCommonMessage = async (args: MessageArgs) => {
  return sendMessage({
    ...args,
  });
};
