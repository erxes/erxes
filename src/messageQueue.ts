import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';
import { ActivityLogs, Conversations } from './db/models';
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

const reciveMessage = async ({ action, data }: IMessage) => {
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

const initConsumer = async () => {
  // Consumer
  try {
    const conn = await amqplib.connect(RABBITMQ_HOST);
    const channel = await conn.createChannel();

    await channel.assertQueue('widgetNotification');

    channel.consume('widgetNotification', async msg => {
      if (msg !== null) {
        await reciveMessage(JSON.parse(msg.content.toString()));
        channel.ack(msg);
      }
    });
  } catch (e) {
    debugBase(e.message);
  }
};

initConsumer();
