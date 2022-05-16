import { sendMessage, ISendMessageArgs } from '@erxes/api-utils/src/core';
import { sendToWebhook as sendWebhook } from '@erxes/api-utils/src';
import { serviceDiscovery, debug } from './configs';
import { generateModels } from './connectionResolver';
import { start, sendBulkSms } from './sender';
import { CAMPAIGN_KINDS } from './constants';

export let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('engages:pre-notification', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);

    const { engageMessage, customerInfos = [] } = data;

    if (
      engageMessage.kind === CAMPAIGN_KINDS.MANUAL &&
      customerInfos.length === 0
    ) {
      await models.Logs.createLog(
        engageMessage._id,
        'failure',
        'No customers found'
      );
      throw new Error('No customers found');
    }

    const MINUTELY =
      engageMessage.scheduleDate &&
      engageMessage.scheduleDate.type === 'minute';

    if (
      !(
        engageMessage.kind === CAMPAIGN_KINDS.AUTO &&
        MINUTELY &&
        customerInfos.length === 0
      )
    ) {
      await models.Logs.createLog(
        engageMessage._id,
        'regular',
        `Matched ${customerInfos.length} customers`
      );
    }

    if (
      engageMessage.scheduleDate &&
      engageMessage.scheduleDate.type === 'pre'
    ) {
      await models.EngageMessages.updateOne(
        { _id: engageMessage._id },
        { $set: { 'scheduleDate.type': 'sent' } }
      );
    }

    if (customerInfos.length > 0) {
      await models.EngageMessages.updateOne(
        { _id: engageMessage._id },
        { $set: { totalCustomersCount: customerInfos.length } }
      );
    }
  });

  consumeQueue('engages:notification', async ({ subdomain, data }) => {
    debug.info(`Receiving queue data ${JSON.stringify(data)}`);

    const models = await generateModels(subdomain);

    try {
      const { action, data: realData } = data;

      if (action === 'sendEngage') {
        await start(models, subdomain, realData);
      }

      if (action === 'writeLog') {
        await models.Logs.createLog(data.engageMessageId, 'regular', data.msg);
      }

      if (action === 'sendEngageSms') {
        await sendBulkSms(models, subdomain, realData);
      }
    } catch (e) {
      debug.error(e.message);
    }
  });

  consumeQueue(
    'engages:removeCustomersEngages',
    async ({ data: { customerIds }, subdomain }) => {
      const models = await generateModels(subdomain);

      await models.EngageMessages.removeCustomersEngages(customerIds);
    }
  );

  consumeQueue(
    'engages:changeCustomer',
    async ({ data: { customerId, customerIds }, subdomain }) => {
      const models = await generateModels(subdomain);

      await models.EngageMessages.changeCustomer(customerId, customerIds);
    }
  );

  consumeRPCQueue(
    'engages:createVisitorOrCustomerMessages',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.EngageMessages.createVisitorOrCustomerMessages(data)
      };
    }
  );
};

export const removeEngageConversations = async (_id): Promise<any> => {
  return client.consumeQueue('removeEngageConversations', _id);
};

export default function() {
  return client;
}

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

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export const sendInboxMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'inbox',
    ...args
  });
};

export const sendLogsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'logs',
    ...args
  });
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'segments',
    ...args
  });
};

export const sendTagsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'tags',
    ...args
  });
};

export const sendIntegrationsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'integrations',
    ...args
  });
};

export const sendEmailTemplatesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'emailTemplates',
    ...args
  });
};

export const sendToWebhook = ({ subdomain, data }) => {
  return sendWebhook(client, { subdomain, data });
};
