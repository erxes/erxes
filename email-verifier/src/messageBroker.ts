import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';
import { bulk, single } from './api';
import { debugBase } from './utils';

dotenv.config();

const { NODE_ENV, RABBITMQ_HOST = 'amqp://localhost' } = process.env;

let conn;
let channel;

export const initConsumer = async () => {
  try {
    conn = await amqplib.connect(RABBITMQ_HOST);
    channel = await conn.createChannel();

    // listen for erxes api ===========
    await channel.assertQueue('erxes-api:email-verifier-notification');

    channel.consume('erxes-api:email-verifier-notification', async msg => {
      if (msg !== null) {
        const { action, data } = JSON.parse(msg.content.toString());

        debugBase(`Receiving queue data from erxes-api`, action, data);

        if (action === 'emailVerify') {
          const { emails, email } = data;
          email ? single(email) : bulk(emails);
        }

        channel.ack(msg);
      }
    });
  } catch (e) {
    debugBase(e.message);
  }
};

interface IQueueData {
  action: string;
  data: any;
}

export const sendMessage = async (queueName: string, data: IQueueData) => {
  if (NODE_ENV === 'test') {
    return;
  }

  debugBase(`Sending data from email verifier to ${queueName}`, data);

  try {
    await channel.assertQueue(queueName);
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data || {})));
  } catch (e) {
    debugBase(e.message);
  }
};
