import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('rcfa:rcfa.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.RCFA.find(data).lean()
    };
  });
};

export const sendContactsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'contacts',
    ...args
  });
};

export const sendFormsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'forms',
    ...args
  });
};

export const sendCardsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args
  });
};

export const sendCoreMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args
  });
};

export const sendRiskAssessmentsMessage = (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'riskassessment',
    ...args
  });
};

export default function() {
  return client;
}
