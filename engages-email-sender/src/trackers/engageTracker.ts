import * as AWS from 'aws-sdk';
import { debugBase } from '../debuggers';
import messageBroker from '../messageBroker';
import { Configs, DeliveryReports, Stats } from '../models';
import { ISESConfig } from '../models/Configs';
import { SES_DELIVERY_STATUSES } from '../constants';
import { routeErrorHandling } from '../utils';

export const getApi = async (type: string): Promise<any> => {
  const config: ISESConfig = await Configs.getSESConfigs();

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
const handleMessage = async message => {
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

  const exists = await DeliveryReports.findOne({
    ...mailHeaders,
    status: type
  });

  // to prevent duplicate event counting
  if (!exists) {
    await Stats.updateStats(mailHeaders.engageMessageId, type);

    await DeliveryReports.create({
      ...mailHeaders,
      status: type
    });
  }

  const rejected =
    type === SES_DELIVERY_STATUSES.BOUNCE ||
    type === SES_DELIVERY_STATUSES.COMPLAINT ||
    type === SES_DELIVERY_STATUSES.REJECT;

  if (rejected) {
    await messageBroker().sendMessage('engagesNotification', {
      action: 'setSubscribed',
      data: { customerId: mailHeaders.customerId, status: type }
    });
  }

  return true;
};

export const trackEngages = expressApp => {
  expressApp.post(
    `/service/engage/tracker`,
    routeErrorHandling(async (req, res) => {
      const chunks: any = [];

      req.setEncoding('utf8');

      req.on('data', chunk => {
        chunks.push(chunk);
      });

      req.on('end', async () => {
        const message = JSON.parse(chunks.join(''));

        debugBase(`receiving on tracker: ${message}`);

        const { Type = '', Message = {}, Token = '', TopicArn = '' } = message;

        if (Type === 'SubscriptionConfirmation') {
          await getApi('sns').then(api =>
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

        await handleMessage(Message);

        return res.end('success');
      });
    })
  );
};

export const awsRequests = {
  async getVerifiedEmails() {
    const api = await getApi('ses');

    return new Promise((resolve, reject) => {
      api.listVerifiedEmailAddresses((error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(data.VerifiedEmailAddresses);
      });
    });
  },

  async verifyEmail(email: string) {
    const api = await getApi('ses');

    return new Promise((resolve, reject) => {
      api.verifyEmailAddress({ EmailAddress: email }, (error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(data);
      });
    });
  },

  async removeVerifiedEmail(email: string) {
    const api = await getApi('ses');

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
