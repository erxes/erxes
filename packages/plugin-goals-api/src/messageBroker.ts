import { generateModels } from './connectionResolver';
import {
  escapeRegExp,
  ISendMessageArgs,
  sendMessage
} from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('goals:find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Goals.find(data).lean(),
      status: 'success'
    };
  });

  consumeRPCQueue('goals:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Goals.findOne(data).lean(),
      status: 'success'
    };
  });

  consumeRPCQueue('goals:createGoal', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Goals.createGoal(data)
    };
  });
};

export const sendCardsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'cards',
    ...args
  });
};
export const sendBoardMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'boards',
    ...args
  });
};
export const sendStageMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  try {
    // Assuming 'client' and 'serviceDiscovery' are defined somewhere in your code
    const result = await sendMessage({
      client,
      serviceDiscovery,
      serviceName: 'cards',
      ...args
    });
    return result;
  } catch (error) {
    console.error('Error sending stage message:', error);
    throw error;
  }
};
export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
