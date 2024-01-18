import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

import { generateModels } from './connectionResolver';
import fetch from 'node-fetch';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('loans:contracts.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Contracts.find(data).lean(),
    };
  });

  consumeRPCQueue('loans:transactions.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Transactions.find(data).lean(),
    };
  });

  consumeRPCQueue(
    'loans:transactions.findAtContracts',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const contracts = await models.Contracts.find(data, { _id: 1 }).lean();

      return {
        status: 'success',
        data: await models.Transactions.find({
          contractId: { $in: contracts.map((c) => c._id) },
        }).lean(),
      };
    },
  );
  consumeRPCQueue('loans:transaction', async ({ subdomain, data }) => {
    console.log('subdomain, data', subdomain, data);
    return [];
  });
};

export const sendMessageBroker = async (
  args: ISendMessageArgs,
  name:
    | 'core'
    | 'cards'
    | 'reactions'
    | 'contacts'
    | 'products'
    | 'forms'
    | 'clientportal'
    | 'syncerkhet'
    | 'ebarimt',
): Promise<any> => {
  return sendMessage({
    client,
    serviceName: name,
    ...args,
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'core',
    ...args,
  });
};

export const sendCardsMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'cards',
    ...args,
  });
};

export const sendReactionsMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'reactions',
    ...args,
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string },
): Promise<any> => {
  return sendMessage({
    client,
    ...args,
  });
};

export const getConfig = async (
  code: string,
  subdomain: string,
  defaultValue?: string,
) => {
  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfigs',
    data: {},
    isRPC: true,
    defaultValue: [],
  });

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const sendSms = async (
  subdomain: string,
  type: string,
  phoneNumber: string,
  content: string,
) => {
  if (type === 'messagePro') {
    const MESSAGE_PRO_API_KEY = await getConfig(
      'MESSAGE_PRO_API_KEY',
      subdomain,
      '',
    );

    const MESSAGE_PRO_PHONE_NUMBER = await getConfig(
      'MESSAGE_PRO_PHONE_NUMBER',
      subdomain,
      '',
    );

    if (!MESSAGE_PRO_API_KEY || !MESSAGE_PRO_PHONE_NUMBER) {
      throw new Error('messaging config not set properly');
    }

    try {
      await fetch(
        'https://api.messagepro.mn/send?' +
          new URLSearchParams({
            key: MESSAGE_PRO_API_KEY,
            from: MESSAGE_PRO_PHONE_NUMBER,
            to: phoneNumber,
            text: content,
          }),
      );

      return 'sent';
    } catch (e) {
      throw new Error(e.message);
    }
  }
};

export default function () {
  return client;
}
