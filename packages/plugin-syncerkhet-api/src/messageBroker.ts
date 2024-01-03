import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { afterMutationHandlers } from './afterMutations';
import { afterQueryHandlers } from './afterQueries';
import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';
import { sendRPCMessage } from './messageBrokerErkhet';
import { loansTransactionToErkhet } from './utils/loansTransactionToErkhet';
import { getPostData, orderDeleteToErkhet } from './utils/orders';

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
    const models = await generateModels(subdomain);
    const { pos, order } = data;
    const syncLogDoc = {
      contentType: 'pos:order',
      createdAt: new Date(),
      createdBy: order.userId
    };
    const syncLog = await models.SyncLogs.syncLogsAdd({
      ...syncLogDoc,
      contentId: order._id,
      consumeData: order,
      consumeStr: JSON.stringify(order)
    });
    try {
      const postData = await getPostData(subdomain, pos, order);
      if (!postData) {
        return {
          status: 'success',
          data: {}
        };
      }

      return {
        status: 'success',
        data: await sendRPCMessage(
          models,
          syncLog,
          'rpc_queue:erxes-automation-erkhet',
          {
            action: 'get-response-send-order-info',
            isEbarimt: false,
            payload: JSON.stringify(postData),
            thirdService: true,
            isJson: true
          }
        )
      };
    } catch (e) {
      await models.SyncLogs.updateOne(
        { _id: syncLog._id },
        { $set: { error: e.message } }
      );
      return {
        status: 'success',
        data: { error: e.message }
      };
    }
  });

  consumeRPCQueue('syncerkhet:loanTransaction', async ({ subdomain, data }) => {
    const { generals, orderId } = data;
    const models = await generateModels(subdomain);

    const syncLogDoc = {
      contentType: 'loans:transaction',
      createdAt: new Date()
    };
    const syncLog = await models.SyncLogs.syncLogsAdd({
      ...syncLogDoc,
      contentId: orderId,
      consumeData: data,
      consumeStr: JSON.stringify(data)
    });

    try {
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
        data: await sendRPCMessage(
          models,
          syncLog,
          'rpc_queue:erxes-automation-erkhet',
          {
            action: 'get-response-send-journal-orders',
            isEbarimt: false,
            payload: JSON.stringify(postData),
            thirdService: true,
            isJson: true
          }
        )
      };
    } catch (e) {
      await models.SyncLogs.updateOne(
        { _id: syncLog._id },
        { $set: { error: e.message } }
      );
      return {
        status: 'success',
        data: { error: e.message }
      };
    }
  });

  consumeRPCQueue(
    'syncerkhet:deleteTransaction',
    async ({ subdomain, data }) => {
      const { generals, orderId } = data;
      const models = await generateModels(subdomain);
      const syncLogDoc = {
        contentType: 'loans:transaction',
        createdAt: new Date()
      };
      const syncLog = await models.SyncLogs.syncLogsAdd({
        ...syncLogDoc,
        contentId: orderId,
        consumeData: data,
        consumeStr: JSON.stringify(data)
      });

      try {
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
          data: await sendRPCMessage(
            models,
            syncLog,
            'rpc_queue:erxes-automation-erkhet',
            {
              action: 'get-response-delete-journal-orders',
              isEbarimt: false,
              payload: JSON.stringify(postData),
              thirdService: true,
              isJson: true
            }
          )
        };
      } catch (e) {
        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          { $set: { error: e.message } }
        );
        return {
          status: 'success',
          data: { error: e.message }
        };
      }
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
