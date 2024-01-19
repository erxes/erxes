import { sendMessage, ISendMessageArgs } from '@erxes/api-utils/src/core';
import { sendToWebhook as sendWebhook } from '@erxes/api-utils/src';

import { debug } from './configs';
import { generateModels,IModels } from './connectionResolver';

import { start, sendBulkSms, sendEmail } from './sender';
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
    const models = (await generateModels(subdomain)) as IModels;

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

  consumeQueue('engages:sendEmail', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);

    await sendEmail(models, data);
  });
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
    serviceName: 'contacts',
    ...args
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'core',
    ...args
  });
};

export const sendInboxMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'inbox',
    ...args
  });
};

export const sendLogsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'logs',
    ...args
  });
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'segments',
    ...args
  });
};

export const sendTagsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'tags',
    ...args
  });
};

export const sendIntegrationsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'integrations',
    ...args
  });
};

export const sendEmailTemplatesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'emailtemplates',
    ...args
  });
};

export const sendClientPortalMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    client,
    serviceName: 'clientportal',
    ...args
  });
};

export const sendNotificationsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  const { subdomain, data } = args;
  const models = await generateModels(subdomain);

  const receiversLength = data.receivers.length || 0;

  if (receiversLength > 0) {
    await models.EngageMessages.updateOne(
      { _id: data.engageId },
      { $set: { totalCustomersCount: receiversLength } }
    );
  }

  return sendMessage({
    client,
    serviceName: 'clientportal',
    ...args
  });
};

export const sendToWebhook = ({ subdomain, data }) => {
  return sendWebhook(client, { subdomain, data });
};
