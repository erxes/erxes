import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { consumeCustomer } from './utils/consumeCustomer';
import { consumeInventory, consumeInventoryCategory } from './utils/consumeInventory';
import { getPostData } from './utils/ebarimtData';
import { getConfig } from './utils/utils';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeQueue } = client;

  consumeQueue('rpc_queue:erkhet', async ({ subdomain, data }) => {
    const { object, old_code, action } = data;
    const objectData = JSON.parse(object)[0];
    const doc = objectData.fields;
    const kind = objectData.model;

    switch (kind) {
      case 'inventories.inventory':
        await consumeInventory(subdomain, doc, old_code, action);
        break;
      case 'inventories.category':
        await consumeInventoryCategory(subdomain, doc, old_code, action);
        break;
      case 'customers.customer':
        await consumeCustomer(subdomain, doc, old_code, action);
        break;
    }

    return;
  });

  consumeQueue('syncerkhet:deals.aftermutation', async ({ subdomain, data }) => {
    const deal = data.updatedDocument
    const oldDeal = data.object;
    const destinationStageId = deal.stageId || '';

    if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
      return;
    }

    const configs = await getConfig(subdomain, 'ebarimtConfig', {});

    if (!Object.keys(configs).includes(destinationStageId)) {
      return;
    }

    const config = {
      ...configs[destinationStageId],
      ...await getConfig(subdomain, 'ERKHET', {})
    };
    const postData = await getPostData(subdomain, config, deal)

    const apiAutomationResponse = await sendRPCMessage('rpc_queue:erxes-automation-erkhet', {
      action: 'get-response-send-order-info',
      isEbarimt: config.isEbarimt,
      payload: JSON.stringify(postData),
    });

    if (!apiAutomationResponse) {
      return;
    }
  })
};

export const sendProductsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'products', ...args });
};

export const sendContactsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'contacts', ...args });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'core', ...args });
};

export const sendNotificationsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'notifications', ...args });
};

export const sendCommonMessage = async (channel, message): Promise<any> => {
  return client.sendMessage(channel, message);
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export default function () {
  return client;
}
