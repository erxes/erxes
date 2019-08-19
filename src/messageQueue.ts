import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';
import { debugBase, debugGmail } from './debuggers';
import { watchPushNotification } from './gmail/watch';
import { Integrations } from './models';

dotenv.config();

const { NODE_ENV, RABBITMQ_HOST = 'amqp://localhost' } = process.env;

const handleRunCronMessage = async () => {
  if (NODE_ENV === 'test') {
    return;
  }

  const integrations = await Integrations.aggregate([
    {
      $match: { email: { $exists: true } }, // email field indicates the gmail
    },
    {
      $lookup: {
        from: 'accounts',
        localField: 'accountId',
        foreignField: '_id',
        as: 'accounts',
      },
    },
    {
      $unwind: '$accounts',
    },
    {
      $project: {
        access_token: '$accounts.token',
        refresh_token: '$accounts.tokenSecret',
        scope: '$accounts.scope',
        expire_date: '$accounts.expireDate',
      },
    },
  ]);

  if (!integrations) {
    return debugGmail('Gmail Integration not found');
  }

  for (const { _id, accountId, ...credentials } of integrations) {
    const response = await watchPushNotification(accountId, credentials);
    const { historyId, expiration } = response.data;

    if (!historyId || !expiration) {
      return debugGmail('Error Google: Failed to renew push notification');
    }

    await Integrations.updateOne({ _id }, { $set: { gmailHistoryId: historyId, expiration } });
  }
};

const initConsumer = async () => {
  // Consumer
  try {
    const conn = await amqplib.connect(RABBITMQ_HOST);
    const channel = await conn.createChannel();

    await channel.assertQueue('erxes-api:run-integrations-cronjob');

    channel.consume('erxes-api:run-integrations-cronjob', async msg => {
      if (msg) {
        await handleRunCronMessage();
        channel.ack(msg);
      }
    });
  } catch (e) {
    debugBase(e.message);
  }
};

initConsumer();
