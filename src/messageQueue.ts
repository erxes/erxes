import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';
import { conversationNotifReceivers } from './data/resolvers/mutations/conversations';
import { sendMobileNotification } from './data/utils';
import { ActivityLogs, Conversations, Customers } from './db/models';
import { debugBase } from './debuggers';
import { graphqlPubsub } from './pubsub';
import { get, set } from './redisClient';

dotenv.config();

const { NODE_ENV, RABBITMQ_HOST = 'amqp://localhost' } = process.env;

interface IWidgetMessage {
  action: string;
  data: {
    trigger: string;
    type: string;
    payload: any;
  };
}

let connection;
let channel;

const receiveWidgetNotification = async ({ action, data }: IWidgetMessage) => {
  if (NODE_ENV === 'test') {
    return;
  }

  if (action === 'callPublish') {
    if (data.trigger === 'conversationMessageInserted') {
      const { customerId, conversationId, content } = data.payload;
      const conversation = await Conversations.findOne(
        { _id: conversationId },
        {
          integrationId: 1,
          participatedUserIds: 1,
          assignedUserId: 1,
        },
      );
      const customerLastStatus = await get(`customer_last_status_${customerId}`);

      // if customer's last status is left then mark as joined when customer ask
      if (conversation) {
        if (customerLastStatus === 'left') {
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

        sendMobileNotification({
          title: 'You have a new message',
          body: content,
          customerId,
          conversationId,
          receivers: conversationNotifReceivers(conversation, customerId),
        });
      }
    }

    graphqlPubsub.publish(data.trigger, { [data.trigger]: data.payload });
  }

  if (action === 'activityLog') {
    ActivityLogs.createLogFromWidget(data.type, data.payload);
  }
};

export const sendMessage = async (queueName: string, data?: any) => {
  if (channel) {
    await channel.assertQueue(queueName);
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data || {})));
  }
};

const initConsumer = async () => {
  // Consumer
  try {
    connection = await amqplib.connect(RABBITMQ_HOST);
    channel = await connection.createChannel();

    // listen for widgets api =========
    await channel.assertQueue('widgetNotification');

    channel.consume('widgetNotification', async msg => {
      if (msg !== null) {
        await receiveWidgetNotification(JSON.parse(msg.content.toString()));
        channel.ack(msg);
      }
    });

    // listen for engage api ===========
    await channel.assertQueue('engages-api:set-donot-disturb');

    channel.consume('engages-api:set-donot-disturb', async msg => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());

        await Customers.updateOne({ _id: data.customerId }, { $set: { doNotDisturb: 'Yes' } });

        channel.ack(msg);
      }
    });
  } catch (e) {
    debugBase(e.message);
  }
};

initConsumer();
