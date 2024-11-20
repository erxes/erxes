import { consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';
import { generateModels } from './connectionResolver';
import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgs,
  MessageArgsOmitService
} from '@erxes/api-utils/src/core';

export const setupMessageConsumers = async () => {
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

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args
  });
};

export const sendSalesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'sales',
    ...args
  });
};

export const sendTasksMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "tasks",
    ...args
  });
};

export const sendTicketsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "tickets",
    ...args
  });
};

export const sendPurchasesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "purchases",
    ...args
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args
  });
};
