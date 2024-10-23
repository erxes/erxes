import * as AWS from 'aws-sdk';

import { getSubdomain } from '@erxes/api-utils/src/core';
import { debugInfo } from '@erxes/api-utils/src/debuggers';
import { sendMessage } from '@erxes/api-utils/src/messageBroker';
import { generateModels, IModels } from '../connectionResolver';
import { SES_DELIVERY_STATUSES } from '../constants';
import { sendCoreMessage } from '../messageBroker';
import { ISESConfig } from '../models/Configs';

export const getApi = async (models: IModels, type: string): Promise<any> => {
  const config: ISESConfig = await models.Configs.getSESConfigs();
  if (!config) {
    return;
  }

  AWS.config.update(config);

  if (type === 'ses') {
    return new AWS.SES();
  }

  return new AWS.SNS();
};

/**
 * Receives notification from amazon simple notification service
 * And updates engage message status and stats
 */
const handleMessage = async (models: IModels, subdomain: string, message) => {
  let parsedMessage;

  try {
    parsedMessage = JSON.parse(message);
  } catch (e) {
    parsedMessage = message;
  }

  console.log('parsedMessage', parsedMessage);

  const { eventType, mail } = parsedMessage;

  if (!mail) {
    return;
  }

  const { headers } = mail;

  const engageMessageId = headers.find(
    (header) => header.name === 'Engagemessageid'
  );

  const mailId = headers.find((header) => header.name === 'Mailmessageid');

  const customerId = headers.find((header) => header.name === 'Customerid');

  const emailDeliveryId = headers.find(
    (header) => header.name === 'Emaildeliveryid'
  );

  const to = headers.find((header) => header.name === 'To');

  const type = eventType.toLowerCase();

  // change message destination after EmailDeliveries are migrated
  // TODO: Message without consumer
  if (emailDeliveryId) {
    return sendMessage('engagesNotification', {
      subdomain,
      data: {
        emailDeliveryId: emailDeliveryId.value,
        status: type,
        action: 'transactionEmail',
      },
    });
  }

  const mailHeaders = {
    engageMessageId: engageMessageId && engageMessageId.value,
    mailId: mailId && mailId.value,
    customerId: customerId && customerId.value,
    email: to && to.value,
  };

  const exists = await models.DeliveryReports.findOne({
    ...mailHeaders,
    status: type,
  });

  // to prevent duplicate event counting
  if (!exists) {
    await models.Stats.updateStats(mailHeaders.engageMessageId, type);

    await models.DeliveryReports.create({ ...mailHeaders, status: type });
  }

  const rejected =
    type === SES_DELIVERY_STATUSES.BOUNCE ||
    type === SES_DELIVERY_STATUSES.COMPLAINT ||
    type === SES_DELIVERY_STATUSES.REJECT;

  if (rejected) {
    sendCoreMessage({
      subdomain,
      action: 'customers.setUnsubscribed',
      isRPC: false,
      data: { _id: mailHeaders.customerId, status: type },
    });
  }

  return true;
};

// AWS service middleware

export const engageTracker = async (req, res) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    // Handle case where req.body is populated (typically for SaaS SES events)
    if (req.body && Object.keys(req.body).length) {
      const { message: messageString } = req.body;

      if (messageString) {
        const message = JSON.parse(messageString);

        await handleMessage(models, subdomain, message);

        return res.end('success');
      }

      return res.end('no message content');
    }

    // Handle case for streamed incoming data (e.g., SNS notifications)
    const chunks: any = [];

    req.setEncoding('utf8');

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      try {
        const message = JSON.parse(chunks.join(''));

        debugInfo(`Receiving on tracker: ${JSON.stringify(message)}`);

        const { Type = '', Message = {}, Token = '', TopicArn = '' } = message;

        // Handle SNS Subscription Confirmation
        if (Type === 'SubscriptionConfirmation') {
          const snsApi = await getApi(models, 'sns');
          await snsApi.confirmSubscription({ Token, TopicArn }).promise();

          return res.end('success');
        }

        // Handle SNS topic validation confirmation for SES event publishing
        if (
          Message ===
          'Successfully validated SNS topic for Amazon SES event publishing.'
        ) {
          return res.end('success');
        }

        // Process the actual message
        await handleMessage(models, subdomain, Message);

        return res.end('success');
      } catch (error) {
        console.error('Error processing message:', error);
        return res.status(500).end('Error processing message');
      }
    });
  } catch (error) {
    console.error('Error in engageTracker:', error);
    return res.status(500).end('Internal server error');
  }
};

export const awsRequests = {
  async getVerifiedEmails(models: IModels) {
    const api = await getApi(models, 'ses');

    return new Promise((resolve, reject) => {
      api.listVerifiedEmailAddresses((error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(data.VerifiedEmailAddresses);
      });
    });
  },

  async verifyEmail(models: IModels, email: string) {
    const api = await getApi(models, 'ses');

    return new Promise((resolve, reject) => {
      api.verifyEmailAddress({ EmailAddress: email }, (error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(data);
      });
    });
  },

  async removeVerifiedEmail(models: IModels, email: string) {
    const api = await getApi(models, 'ses');

    return new Promise((resolve, reject) => {
      api.deleteVerifiedEmailAddress({ EmailAddress: email }, (error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(data);
      });
    });
  },
};
