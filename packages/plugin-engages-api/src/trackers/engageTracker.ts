import * as AWS from 'aws-sdk';

import { debugBase } from '../debuggers';
import messageBroker, { sendContactsMessage } from '../messageBroker';
import { ISESConfig } from '../models/Configs';
import { SES_DELIVERY_STATUSES } from '../constants';
import { generateModels, IModels } from '../connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';

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

  const { eventType, mail } = parsedMessage;

  if (!mail) {
    return;
  }

  const { headers } = mail;

  const engageMessageId = headers.find(
    header => header.name === 'Engagemessageid'
  );

  const mailId = headers.find(header => header.name === 'Mailmessageid');

  const customerId = headers.find(header => header.name === 'Customerid');

  const emailDeliveryId = headers.find(
    header => header.name === 'Emaildeliveryid'
  );

  const to = headers.find(header => header.name === 'To');

  const type = eventType.toLowerCase();

  // change message destination after EmailDeliveries are migrated
  if (emailDeliveryId) {
    return messageBroker().sendMessage('engagesNotification', {
      action: 'transactionEmail',
      data: { emailDeliveryId: emailDeliveryId.value, status: type }
    });
  }

  const mailHeaders = {
    engageMessageId: engageMessageId && engageMessageId.value,
    mailId: mailId && mailId.value,
    customerId: customerId && customerId.value,
    email: to && to.value
  };

  const exists = await models.DeliveryReports.findOne({
    ...mailHeaders,
    status: type
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
    sendContactsMessage({
      subdomain,
      action: 'customers.setUnsubscribed',
      isRPC: false,
      data: { _id: mailHeaders.customerId, status: type }
    });
  }

  return true;
};

// aws service middleware
export const engageTracker = async (req, res) => {
  const chunks: any = [];

  req.setEncoding('utf8');

  req.on('data', chunk => {
    chunks.push(chunk);
  });

  req.on('end', async () => {
    const message = JSON.parse(chunks.join(''));

    debugBase(`receiving on tracker: ${JSON.stringify(message)}`);

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const { Type = '', Message = {}, Token = '', TopicArn = '' } = message;

    if (Type === 'SubscriptionConfirmation') {
      await getApi(models, 'sns').then(api =>
        api.confirmSubscription({ Token, TopicArn }).promise()
      );

      return res.end('success');
    }

    if (
      Message ===
      'Successfully validated SNS topic for Amazon SES event publishing.'
    ) {
      res.end('success');
    }

    await handleMessage(models, subdomain, Message);

    return res.end('success');
  });
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
  }
};
