import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';
import { ActivityLogs, Conversations, Customers } from './db/models';
import { debugBase } from './debuggers';
import { graphqlPubsub } from './pubsub';
import { get, set } from './redisClient';

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

let connection;
let channel;

const receiveMessage = async ({ action, data }: IMessage) => {
  if (NODE_ENV === 'test') {
    return;
  }

  if (action === 'callPublish') {
    if (data.trigger === 'conversationMessageInserted') {
      const { customerId, conversationId } = data.payload;
      const conversation = await Conversations.findOne({ _id: conversationId }, { integrationId: 1 });
      const customerLastStatus = await get(`customer_last_status_${customerId}`);

      // if customer's last status is left then mark as joined when customer ask
      if (conversation && customerLastStatus === 'left') {
        set(`customer_last_status_${customerId}`, 'joined');

        // customer has joined + time
        const conversationMessages = await Conversations.changeCustomerStatus(
          'joined',
          customerId,
          conversation.integrationId,
        );

        for (const message of conversationMessages) {
          graphqlPubsub.publish('conversationMessageInserted', {
            conversationMessageInserted: message,
          });
        }

        // notify as connected
        graphqlPubsub.publish('customerConnectionChanged', {
          customerConnectionChanged: {
            _id: customerId,
            status: 'connected',
          },
        });
      }
    }

    graphqlPubsub.publish(data.trigger, { [data.trigger]: data.payload });
  }

  if (action === 'activityLog') {
    ActivityLogs.createLogFromWidget(data.type, data.payload);
  }
};

const buildMessage = (action: string, data?: IMessage) => {
  return Buffer.from(JSON.stringify({ action, data }));
};

export const notifyRunCron = async () => {
  if (channel) {
    await channel.sendToQueue('erxes-api-queue', buildMessage('cronjob'));
  }
};

const initConsumer = async () => {
  // Consumer
  try {
    connection = await amqplib.connect(RABBITMQ_HOST);
    channel = await connection.createChannel();

    await channel.assertQueue('widgetNotification');

    channel.consume('widgetNotification', async msg => {
      if (msg !== null) {
        await receiveMessage(JSON.parse(msg.content.toString()));
        channel.ack(msg);
      }
    });

    await channel.assertQueue('engagesApi');

    channel.consume('engagesApi', async msg => {
      if (msg !== null) {
        const { data } = JSON.parse(msg.content.toString());

        await Customers.updateOne({ _id: data.customerId }, { $set: { doNotDisturb: 'Yes' } });

        channel.ack(msg);
      }
    });
  } catch (e) {
    debugBase(e.message);
  }
};

initConsumer();
