import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';
import { generateModels } from './connectionResolver';

export const initBroker = async () => {
  consumeRPCQueue('documents:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Documents.findOne(data).lean(),
    };
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string },
): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
