import { sendMessage, ISendMessageArgs } from '@erxes/api-utils/src/core';

import { serviceDiscovery, debug } from './configs';
import { generateModels } from './connectionResolver';
import { start, sendBulkSms } from './sender';

export let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('engages:notification', async ({ subdomain, data }) => {
    debug.info(`Receiving queue data from erxes-api ${JSON.stringify(data)}`);

    const models = await generateModels(subdomain);

    const { action, data: realData } = data;

    // if (
    //   engageMessage.kind === CAMPAIGN_KINDS.MANUAL &&
    //   customerInfos.length === 0
    // ) {
    //   await models.EngageMessages.deleteOne({ _id: engageMessage._id });
    //   throw new Error('No customers found');
    // }
  
    // if (
    //   !(
    //     engageMessage.kind === CAMPAIGN_KINDS.AUTO &&
    //     MINUTELY &&
    //     customerInfos.length === 0
    //   )
    // ) {
    //   await models.Logs.createLog(
    //     engageMessageId,
    //     'regular',
    //     `Matched ${customerInfos.length} customers`
    //   );
    // }
  
    // if (engageMessage.scheduleDate && engageMessage.scheduleDate.type === 'pre') {
    //   await models.EngageMessages.updateOne(
    //     { _id: engageMessage._id },
    //     { $set: { 'scheduleDate.type': 'sent' } }
    //   );
    // }
  
    // if (customerInfos.length > 0) {
    //   await models.EngageMessages.updateOne(
    //     { _id: engageMessage._id },
    //     { $set: { totalCustomersCount: customerInfos.length } }
    //   );
    // }

    if (action === 'sendEngage') {
      await start(models, realData);
    }

    if (action === 'writeLog') {
      await models.Logs.createLog(data.engageMessageId, 'regular', data.msg);
    }

    if (action === 'sendEngageSms') {
      await sendBulkSms(models, realData);
    }
  });

  consumeQueue('engage:removeCustomersEngages', async ({ data: { customerIds }, subdomain }) => {
    const models = await generateModels(subdomain);

    await models.EngageMessages.removeCustomersEngages(customerIds);
  });

  consumeQueue('engage:changeCustomer', async ({ data: { customerId, customerIds }, subdomain }) => {
    const models = await generateModels(subdomain);

    await models.EngageMessages.changeCustomer(customerId, customerIds);
  });

  consumeRPCQueue('engages:createVisitorOrCustomerMessages', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.EngageMessages.createVisitorOrCustomerMessages(data)
    }
  });
};

export const sendRPCMessage = async (message): Promise<any> => {
  return client.sendRPCMessage('rpc_queue:api_to_integrations', message);
};

export const createConversationAndMessage = async (doc): Promise<any> => {
  if(!(await serviceDiscovery.isEnabled('inbox'))) {
    return null;
  }

  if(!(await serviceDiscovery.isAvailable("inbox"))) {
    throw new Error(`Inbox service is not available`);
  }

  return client.sendRPCMessage('inbox:rpc_queue:createConversationAndMessage', doc);
};

export const updateConversationMessage = async (data: any) => {
  if(!(await serviceDiscovery.isEnabled('inbox'))) {
    return null;
  }

  if(!(await serviceDiscovery.isAvailable("inbox"))) {
    throw new Error(`Inbox service is not available`);
  }

  return client.sendRPCMessage('inbox:rpc_queue:updateConversationMessage', data);
};

export const removeEngageConversations = async (_id): Promise<any> => {
  return client.consumeQueue('removeEngageConversations', _id);
};

export default function() {
  return client;
}

export const sendContactsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'contacts', ...args });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'core', ...args });
};

export const sendInboxMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'inbox', ...args });
};

export const sendLogsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'logs', ...args });
};

export const sendSegmentsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'segments', ...args });
};

export const sendTagsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'tags', ...args });
};
