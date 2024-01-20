import { MessageArgs, MessageArgsOmitService, sendMessage } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  consumeRPCQueue('rcfa:rcfa.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.RCFA.find(data).lean()
    };
  });
};

export const sendContactsMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: 'contacts',
    ...args
  });
};

export const sendFormsMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: 'forms',
    ...args
  });
};

export const sendCardsMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args
  });
};

export const sendCoreMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args
  });
};

export const sendRiskAssessmentsMessage = (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'riskassessment',
    ...args
  });
};
