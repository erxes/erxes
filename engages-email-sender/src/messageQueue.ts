import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';
import { debugBase } from './debuggers';
import { Logs } from './models';
import { start } from './sender';

dotenv.config();

const { NODE_ENV, RABBITMQ_HOST = 'amqp://localhost' } = process.env;

let conn;
let channel;

export const initConsumer = async () => {
  try {
    conn = await amqplib.connect(RABBITMQ_HOST);
    channel = await conn.createChannel();

    // listen for erxes api ===========
    await channel.assertQueue('erxes-api:engages-notification');

    channel.consume('erxes-api:engages-notification', async msg => {
      if (msg !== null) {
        const { action, data } = JSON.parse(msg.content.toString());

        debugBase(`Receiving queue data from erxes-api`, data);

        if (action === 'sendEngage') {
          await start(data);
        }

        if (action === 'writeLog') {
          await Logs.createLog(data.engageMessageId, 'regular', data.msg);
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

  debugBase(`Sending data to engagesApi queue`, data);

  try {
    await channel.assertQueue(queueName);
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data || {})));
  } catch (e) {
    debugBase(e.message);
  }
};
