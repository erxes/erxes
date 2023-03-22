import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import Khanbank from './khanbank/khanbank';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('khanbank:send', async ({ data }) => {
    return {
      status: 'success'
    };
  });

  // consumeRPCQueue('khanbank:accounts', async ({ data }) => {
  //   const { consumerKey, secretKey } = data;

  //   const config: any = { consumerKey, secretKey };

  //   const api = new Khanbank(config);

  //   const response = await api.accounts.list();

  //   return {
  //     status: 'success',
  //     data: response,
  //   };
  // });

  // consumeRPCQueue('khanbank:accountDetail', async ({ data }) => {
  //   const { consumerKey, secretKey, accountNumber } = data;

  //   if (!accountNumber) {
  //     throw new Error('Account number is required');
  //   }

  //   const config: any = { consumerKey, secretKey };

  //   const api = new Khanbank(config);

  //   const response = await api.accounts.get(accountNumber);

  //   return {
  //     status: 'success',
  //     data: response,
  //   };
  // });

  // consumeRPCQueue('khanbank:accountHolder', async ({ data }) => {
  //   const { consumerKey, secretKey, accountNumber, bankCode } = data;

  //   if (!accountNumber || !bankCode) {
  //     throw new Error('Account and bank code is required');
  //   }

  //   const config: any = { consumerKey, secretKey };

  //   const api = new Khanbank(config);

  //   const response = await api.accounts.getHolder(accountNumber, bankCode);

  //   return {
  //     status: 'success',
  //     data: response,
  //   };
  // });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
