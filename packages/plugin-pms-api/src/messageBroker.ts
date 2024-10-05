import { sendMessage, MessageArgsOmitService } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

export const setupMessageConsumers = async () => {
  consumeRPCQueue('multierkhet:getConfig', async ({ subdomain, data }) => {
    const { code, defaultValue } = data;
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: models.Configs.getConfig(code, defaultValue),
    };
  });
};

export const sendProductsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendContactsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendSalesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'sales',
    ...args,
  });
};

export const sendPosMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'pos',
    ...args,
  });
};

export const sendEbarimtMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'ebarimt',
    ...args,
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

export const sendNotificationsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'notifications',
    ...args,
  });
};
