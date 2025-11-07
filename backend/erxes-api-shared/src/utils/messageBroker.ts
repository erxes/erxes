import amqplib from 'amqplib';
import { redis } from './redis';
import { InterMessage } from './trpc';
import { debugError, debugInfo } from './debugger';

const { RABBITMQ_HOST, MESSAGE_BROKER_PREFIX } = process.env;

const checkQueueName = async (queueName: string, isSend = false) => {
  const [serviceName, action] = queueName.split(':');

  if (!serviceName) {
    throw new Error(
      `Invalid queue name. ${queueName}. Queue name must include :`,
    );
  }

  if (action) {
    if (isSend) {
      const isMember = await redis.sismember(
        `service:queuenames:${serviceName}`,
        action,
      );

      if (isMember === 0) {
        throw new Error(`Not existing queuename ${queueName}`);
      }
    }

    return redis.sadd(`service:queuenames:${serviceName}`, action);
  }
};

const showInfoDebug = () => {
  if ((process.env.DEBUG || '').includes('error')) {
    return false;
  }

  return true;
};

let channel: amqplib.Channel | undefined;
const queuePrefix = MESSAGE_BROKER_PREFIX || '';

export const sendMessage = async (
  queueName: string,
  message: InterMessage,
): Promise<void> => {
  if (!channel) {
    throw new Error(`RabbitMQ channel is ${channel}`);
  }

  queueName = queueName.concat(queuePrefix);

  if (message && !message.thirdService) {
    await checkQueueName(queueName, true);
  }

  try {
    const messageJson = JSON.stringify(message || {});

    if (showInfoDebug()) {
      debugInfo(`Sending message ${messageJson} to ${queueName}`);
    }

    await channel.assertQueue(queueName);
    await channel.sendToQueue(queueName, Buffer.from(messageJson));
  } catch (e) {
    debugError(`Error occurred during send queue ${queueName} ${e.message}`);
  }
};
