import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';
import { debugCrons } from '../debuggers';

dotenv.config();

const { RABBITMQ_HOST = 'amqp://localhost' } = process.env;

let connection;
let channel;

export const sendMessage = async (queueName: string, data?: any) => {
  if (channel) {
    await channel.assertQueue(queueName);
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data || {})));
  }
};

const initPublisher = async () => {
  try {
    connection = await amqplib.connect(RABBITMQ_HOST);
    channel = await connection.createChannel();
  } catch (e) {
    debugCrons(e.message);
  }
};

initPublisher();
