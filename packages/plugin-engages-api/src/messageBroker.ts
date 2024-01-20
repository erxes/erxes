import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  ISendMessageArgs,
  ISendMessageArgsNoService,
} from '@erxes/api-utils/src/core';
import { sendToWebhook as sendWebhook } from '@erxes/api-utils/src';
import { debug } from './configs';
import { generateModels } from './connectionResolver';
import { start, sendBulkSms, sendEmail } from './sender';
import { CAMPAIGN_KINDS } from './constants';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
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
        'No customers found',
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
        `Matched ${customerInfos.length} customers`,
      );
    }

    if (
      engageMessage.scheduleDate &&
      engageMessage.scheduleDate.type === 'pre'
    ) {
      await models.EngageMessages.updateOne(
        { _id: engageMessage._id },
        { $set: { 'scheduleDate.type': 'sent' } },
      );
    }

    if (customerInfos.length > 0) {
      await models.EngageMessages.updateOne(
        { _id: engageMessage._id },
        { $set: { totalCustomersCount: customerInfos.length } },
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
    },
  );

  consumeQueue(
    'engages:changeCustomer',
    async ({ data: { customerId, customerIds }, subdomain }) => {
      const models = await generateModels(subdomain);

      await models.EngageMessages.changeCustomer(customerId, customerIds);
    },
  );

  consumeRPCQueue(
    'engages:createVisitorOrCustomerMessages',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.EngageMessages.createVisitorOrCustomerMessages(data),
      };
    },
  );

  consumeQueue('engages:sendEmail', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);

    await sendEmail(models, data);
  });
};

export const removeEngageConversations = async (_id): Promise<any> => {
  return client.consumeQueue('removeEngageConversations', _id);
};

export const sendContactsMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendCoreMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendInboxMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'inbox',
    ...args,
  });
};

export const sendLogsMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'logs',
    ...args,
  });
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'segments',
    ...args,
  });
};

export const sendTagsMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'tags',
    ...args,
  });
};

export const sendIntegrationsMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'integrations',
    ...args,
  });
};

export const sendEmailTemplatesMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'emailtemplates',
    ...args,
  });
};
