import { sendCommonMessage, sendRPCMessage } from './messageBrokerErkhet';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { afterMutationHandlers } from './afterMutations';
import { serviceDiscovery } from './configs';
import { afterQueryHandlers } from './afterQueries';
import { getPostData, orderDeleteToErkhet } from './utils/orders';
import { loansTransactionToErkhet } from './utils/loansTransactionToErkhet';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('syncerkhet:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeRPCQueue('syncerkhet:afterQuery', async ({ subdomain, data }) => {
    return {
      status: 'success',
      data: await afterQueryHandlers(subdomain, data)
    };
  });

  consumeRPCQueue('syncerkhet:toOrder', async ({ subdomain, data }) => {
    const { pos, order } = data;

    const postData = await getPostData(subdomain, pos, order);
    if (!postData) {
      return {
        status: 'success',
        data: {}
      };
    }

    return {
      status: 'success',
      data: await sendRPCMessage('rpc_queue:erxes-automation-erkhet', {
        action: 'get-response-send-order-info',
        isEbarimt: false,
        payload: JSON.stringify(postData),
        thirdService: true,
        isJson: true
      })
    };
  });

  consumeRPCQueue('syncerkhet:loanTransaction', async ({ subdomain, data }) => {
    const { generals, orderId } = data;

    const postData = await loansTransactionToErkhet(
      subdomain,
      generals,
      orderId
    );
    if (!postData) {
      return {
        status: 'success',
        data: {}
      };
    }

    return {
      status: 'success',
      data: await sendRPCMessage('rpc_queue:erxes-automation-erkhet', {
        action: 'get-response-send-journal-orders',
        isEbarimt: false,
        payload: JSON.stringify(postData),
        thirdService: true,
        isJson: true
      })
    };
  });

  consumeRPCQueue(
    'syncerkhet:deleteTransaction',
    async ({ subdomain, data }) => {
      const { generals, orderId } = data;

      const postData = await loansTransactionToErkhet(
        subdomain,
        generals,
        orderId
      );
      if (!postData) {
        return {
          status: 'success',
          data: {}
        };
      }

      return {
        status: 'success',
        data: await sendRPCMessage('rpc_queue:erxes-automation-erkhet', {
          action: 'get-response-delete-journal-orders',
          isEbarimt: false,
          payload: JSON.stringify(postData),
          thirdService: true,
          isJson: true
        })
      };
    }
  );

  consumeRPCQueue('syncerkhet:returnOrder', async ({ subdomain, data }) => {
    const { pos, order } = data;

    return {
      status: 'success',
      data: await orderDeleteToErkhet(subdomain, pos, order)
    };
  });
};

export const sendProductsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'products',
    ...args
  });
};

export const sendContactsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendCardsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'cards',
    ...args
  });
};

export const sendPosMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'pos',
    ...args
  });
};

export const sendEbarimtMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'ebarimt',
    ...args
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export const sendNotificationsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'notifications',
    ...args
  });
};

export default function() {
  return client;
}
