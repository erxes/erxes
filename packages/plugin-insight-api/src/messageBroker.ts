import { consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';
import { generateModels } from './connectionResolver';
import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgs,
  MessageArgsOmitService,
} from '@erxes/api-utils/src/core';

export const initBroker = async () => {
  // consumeRPCQueue('goals:find', async ({ subdomain, data }) => {
  //   const models = await generateModels(subdomain);
  //   return {
  //     data: await models.Goals.find(data).lean(),
  //     status: 'success',
  //   };
  // });
  // consumeRPCQueue('goals:findOne', async ({ subdomain, data }) => {
  //   const models = await generateModels(subdomain);
  //   return {
  //     data: await models.Goals.findOne(data).lean(),
  //     status: 'success',
  //   };
  // });
  // consumeRPCQueue('goals:createGoal', async ({ subdomain, data }) => {
  //   const models = await generateModels(subdomain);
  //   return {
  //     status: 'success',
  //     data: await models.Goals.createGoal(data),
  //   };
  // });
};

export const sendCardsMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args,
  });
};

export const sendSegmentsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'segments',
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

export const sendReportsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'reports',
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
