import { debugBase } from './debuggers';
import { EngageMessages, Logs } from './models';
import { sendBulkSms, start } from './sender';
import { serviceDiscovery } from './configs';

export let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('engage:removeCustomersEngages', async customerIds => {
    await EngageMessages.removeCustomersEngages(customerIds);
  });

  consumeQueue('engage:changeCustomer', async ({customerId, customerIds}) => {
    await EngageMessages.changeCustomer(customerId, customerIds);
  });

  // listen for rpc queue =========
  consumeQueue('erxes-api:engages-notification', async ({ action, data }) => {
    debugBase(`Receiving queue data from erxes-api ${JSON.stringify(data)}`);

    if (action === 'sendEngage') {
      await start(data);
    }

    if (action === 'writeLog') {
      await Logs.createLog(data.engageMessageId, 'regular', data.msg);
    }

    if (action === 'sendEngageSms') {
      await sendBulkSms(data);
    }
  });

  consumeRPCQueue('engage:rpc_queue:tag', async args => {
    let data = {};

    if (args.action === 'count') {
      data = await EngageMessages.countDocuments({ tagIds: { $in: args._ids } });
    }

    if (args.action === 'tagObject') {
      await EngageMessages.updateMany(
        { _id: { $in: args.targetIds } },
        { $set: { tagIds: args.tagIds } },
        { multi: true }
      );

      data = await EngageMessages.find({ _id: { $in: args.targetIds } }).lean();
    }

    return {
      status: 'success',
      data
    }
  });

  consumeRPCQueue('engages:createVisitorOrCustomerMessages', async ({ subdomain, data }) => {
    return {
      status: 'success',
      data: await EngageMessages.createVisitorOrCustomerMessages(data)
    }
  });

};

export const sendRPCMessage = async (message): Promise<any> => {
  return client.sendRPCMessage('rpc_queue:api_to_integrations', message);
};

export const findIntegrations = async (query, options?): Promise<any> => {
  return client.sendRPCMessage('rpc_queue:findIntegrations', {
    query,
    options,
  });
};

export const findMongoDocuments = async (serviceName: string, data: any) => {
  if(!(await serviceDiscovery.isEnabled(serviceName))) {
    return [];
  }
  
  if(!(await serviceDiscovery.isAvailable(serviceName))) {
    throw new Error(`${serviceName} service is not available`);
  }

  return client.sendRPCMessage(`${serviceName}:rpc_queue:findMongoDocuments`, data);
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

export const fetchSegment = async (segment, options) => 
  client.sendRPCMessage('rpc_queue:fetchSegment', { segment, options });

export const getCampaignCustomerInfo = async (data) => {
  return client.sendRPCMessage('contacts:rpc_queue:prepareEngageCustomers', data);
};

export default function() {
  return client;
}
