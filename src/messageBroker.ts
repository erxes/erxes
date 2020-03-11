import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';
import * as uuid from 'uuid';
import { debugBase, debugGmail } from './debuggers';
import { handleFacebookMessage } from './facebook/handleFacebookMessage';
import { watchPushNotification } from './gmail/watch';
import { removeAccount, removeCustomers } from './helpers';
import { Integrations } from './models';

dotenv.config();

const { NODE_ENV, RABBITMQ_HOST = 'amqp://localhost' } = process.env;

let conn;
let channel;

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

  for (const { _id, email } of integrations) {
    const response = await watchPushNotification(email);
    const { historyId, expiration } = response.data;

    if (!historyId || !expiration) {
      return debugGmail('Error Google: Failed to renew push notification');
    }

    await Integrations.updateOne({ _id }, { $set: { gmailHistoryId: historyId, expiration } });
  }
};

export const sendRPCMessage = async (message): Promise<any> => {
  const response = await new Promise((resolve, reject) => {
    const correlationId = uuid();

    return channel.assertQueue('', { exclusive: true }).then(q => {
      channel.consume(
        q.queue,
        msg => {
          if (!msg) {
            return reject(new Error('consumer cancelled by rabbitmq'));
          }

          if (msg.properties.correlationId === correlationId) {
            const res = JSON.parse(msg.content.toString());

            if (res.status === 'success') {
              resolve(res.data);
            } else {
              reject(new Error(res.errorMessage));
            }

            channel.deleteQueue(q.queue);
          }
        },
        { noAck: true },
      );

      channel.sendToQueue('rpc_queue:erxes-integrations', Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: q.queue,
      });
    });
  });

  return response;
};

export const sendMessage = async (data?: any) => {
  await channel.assertQueue('integrationsNotification');
  await channel.sendToQueue('integrationsNotification', Buffer.from(JSON.stringify(data || {})));
};

export const initConsumer = async () => {
  // Consumer
  try {
    conn = await amqplib.connect(RABBITMQ_HOST);
    channel = await conn.createChannel();

    await channel.assertQueue('erxes-api:integrations-notification');

    channel.consume('erxes-api:integrations-notification', async msg => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        const { type } = content;

        debugBase(`Received message from api ${msg.content.toString()}`);

        switch (type) {
          case 'facebook':
            await handleFacebookMessage(content);
          case 'cronjob':
            await handleRunCronMessage();
          case 'removeCustomers':
            await removeCustomers(content);
        }

        channel.ack(msg);
      }
    });

    // listen for rpc queue =========
    await channel.assertQueue('rpc_queue:erxes-api');

    channel.consume('rpc_queue:erxes-api', async msg => {
      if (msg !== null) {
        debugBase(`Received rpc queue message ${msg.content.toString()}`);

        const parsedObject = JSON.parse(msg.content.toString());

        const { action, data } = parsedObject;

        let response = null;

        if (action === 'remove-account') {
          try {
            response = {
              status: 'success',
              data: await removeAccount(data._id),
            };
          } catch (e) {
            response = {
              status: 'error',
              errorMessage: e.message,
            };
          }
        }

        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
          correlationId: msg.properties.correlationId,
        });

        channel.ack(msg);
      }
    });
  } catch (e) {
    debugBase(e.message);
  }
};
