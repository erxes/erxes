import * as amqplib from 'amqplib';
import { v4 as uuid } from 'uuid';
import { debugError, debugInfo } from './debuggers';

let channel;
let queuePrefix;
let redisClient;

const checkQueueName = async (queueName, isSend = false) => {
  const [serviceName, action] = queueName.split(':');

  if (!serviceName) {
    throw new Error(
      `Invalid queue name. ${queueName}. Queue name must include :`
    );
  }

  if (action) {
    if (isSend) {
      const isMember = await redisClient.sismember(
        `service:queuenames:${serviceName}`,
        action
      );

      if (isMember === 0) {
        throw new Error(`Not existing queuename ${queueName}`);
      }
    }

    return redisClient.sadd(`service:queuenames:${serviceName}`, action);
  }
};

export const doesQueueExist = async (
  serviceName: string,
  action: string
): Promise<boolean> => {
  const isMember = await redisClient.sismember(
    `service:queuenames:${serviceName}`,
    action
  );

  return isMember !== 0;
};

export const consumeQueue = async (queueName, callback) => {
  queueName = queueName.concat(queuePrefix);
  debugInfo(`consumeQueue ${queueName}`);

  await checkQueueName(queueName);

  await channel.assertQueue(queueName);

  // TODO: learn more about this
  // await channel.prefetch(10);

  try {
    channel.consume(
      queueName,
      async msg => {
        if (msg !== null) {
          try {
            await callback(JSON.parse(msg.content.toString()), msg);
          } catch (e) {
            debugError(
              `Error occurred during callback ${queueName} ${e.message}`
            );
          }

          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (e) {
    debugError(
      `Error occurred during consumeq queue ${queueName} ${e.message}`
    );
  }
};

export const consumeRPCQueue = async (queueName, callback) => {
  queueName = queueName.concat(queuePrefix);

  debugInfo(`consumeRPCQueue ${queueName}`);

  await checkQueueName(queueName);

  try {
    await channel.assertQueue(queueName);

    // TODO: learn more about this
    // await channel.prefetch(10);

    channel.consume(queueName, async msg => {
      if (msg !== null) {
        debugInfo(`Received rpc queue message ${msg.content.toString()}`);

        let response;

        try {
          response = await callback(JSON.parse(msg.content.toString()));
        } catch (e) {
          debugError(
            `Error occurred during callback ${queueName} ${e.message}`
          );

          response = {
            status: 'error',
            errorMessage: e.message
          };
        }

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(response)),
          {
            correlationId: msg.properties.correlationId
          }
        );

        channel.ack(msg);
      }
    });
  } catch (e) {
    debugError(
      `Error occurred during consume rpc queue ${queueName} ${e.message}`
    );
  }
};

export const sendRPCMessage = async (
  queueName: string,
  message: any
): Promise<any> => {
  queueName = queueName.concat(queuePrefix);

  if (!message.thirdService) {
    await checkQueueName(queueName, true);
  }

  debugInfo(
    `Sending rpc message ${JSON.stringify(message)} to queue ${queueName}`
  );

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
              debugInfo(
                `RPC success response for queue ${queueName} ${JSON.stringify(
                  res
                )}`
              );
              resolve(res.data);
            } else {
              debugInfo(
                `RPC error response for queue ${queueName} ${res.errorMessage})}`
              );
              reject(new Error(res.errorMessage));
            }

            channel.deleteQueue(q.queue);
          }
        },
        { noAck: true }
      );

      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: q.queue
      });
    });
  });

  return response;
};

export const sendMessage = async (queueName: string, data?: any) => {
  queueName = queueName.concat(queuePrefix);

  if (!data.thirdService) {
    await checkQueueName(queueName, true);
  }

  try {
    const message = JSON.stringify(data || {});

    debugInfo(`Sending message ${message} to ${queueName}`);

    await channel.assertQueue(queueName);
    await channel.sendToQueue(queueName, Buffer.from(message));
  } catch (e) {
    debugError(`Error occurred during send queue ${queueName} ${e.message}`);
  }
};

export const init = async ({ RABBITMQ_HOST, MESSAGE_BROKER_PREFIX, redis }) => {
  redisClient = redis;

  const connection = await amqplib.connect(RABBITMQ_HOST, { noDelay: true });

  channel = await connection.createChannel();

  queuePrefix = MESSAGE_BROKER_PREFIX || '';

  return {
    consumeQueue,
    consumeRPCQueue,
    sendMessage,
    sendRPCMessage
  };
};
