import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';
import { debugBase, debugGmail } from './debuggers';
import { watchPushNotification } from './gmail/watch';
import { Integrations } from './models';

dotenv.config();

const { NODE_ENV, RABBITMQ_HOST = 'amqp://localhost' } = process.env;

interface IMessage {
  action: string;
  data: {
    trigger: string;
    type: string;
    payload: any;
  };
}

const receiveMessage = async ({ action }: IMessage) => {
  if (NODE_ENV === 'test') {
    return;
  }

  if (action === 'cronjob') {
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
  }
};

const initConsumer = async () => {
  // Consumer
  try {
    const conn = await amqplib.connect(RABBITMQ_HOST);
    const channel = await conn.createChannel();

    await channel.assertQueue('erxes-api-queue');

    channel.consume('erxes-api-queue', async response => {
      if (response !== null) {
        await receiveMessage(parseResponse(response));

        channel.ack(response);
      }
    });
  } catch (e) {
    debugBase(e.message);
  }
};

const parseResponse = (response: any) => {
  return JSON.parse(response.content.toString());
};

initConsumer();
