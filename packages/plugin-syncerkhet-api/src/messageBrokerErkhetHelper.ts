import { debugError, debugInfo } from '@erxes/api-utils/src/debuggers';
import * as amqplib from 'amqplib';
import { v4 as uuid } from 'uuid';

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

  debugInfo(
    `Sending rpc message ${JSON.stringify(message)} to queue ${queueName}`
  );

  const response = await new Promise((resolve, reject) => {
    const correlationId = uuid();

    return channel.assertQueue('', { exclusive: true }).then(q => {
      const timeoutMs = message.timeout || process.env.RPC_TIMEOUT || 590000;
      var interval = setInterval(() => {
        channel.deleteQueue(q.queue);

        clearInterval(interval);

        debugError(`${queueName} ${JSON.stringify(message)} timedout`);

        return resolve({ ...message.defaultValue, error: 'timedout' });
      }, timeoutMs);

      channel.consume(
        q.queue,
        msg => {
          clearInterval(interval);

          if (!msg) {
            channel.deleteQueue(q.queue).catch(() => {});
            return resolve(message?.defaultValue);
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
        replyTo: q.queue,
        expiration: timeoutMs
      });
    });
  });

  return response;
};

function RabbitListener() {}

RabbitListener.prototype.connect = function(RABBITMQ_HOST) {
  const me = this;

  return new Promise(function(resolve) {
    amqplib
      .connect(RABBITMQ_HOST, { noDelay: true })
      .then(
        function(conn) {
          console.log(`Connected to rabbitmq server ${RABBITMQ_HOST}`);

          conn.on('error', me.reconnect.bind(me, RABBITMQ_HOST));

          return conn.createChannel().then(function(chan) {
            channel = chan;
            resolve(chan);
          });
        },
        function connectionFailed(err) {
          console.log('Failed to connect to rabbitmq server', err);
          me.reconnect(RABBITMQ_HOST);
        }
      )
      .catch(function(error) {
        console.log('RabbitMQ: ', error);
      });
  });
};

RabbitListener.prototype.reconnect = function(RABBITMQ_HOST) {
  const reconnectTimeout = 1000 * 60;

  const me = this;

  channel = undefined;

  debugInfo(`Scheduling reconnect to rabbitmq in ${reconnectTimeout / 1000}s`);

  setTimeout(function() {
    debugInfo(`Now attempting reconnect to rabbitmq ...`);
    me.connect(RABBITMQ_HOST);
  }, reconnectTimeout);
};

export const init = async ({ RABBITMQ_HOST, MESSAGE_BROKER_PREFIX, redis }) => {
  redisClient = redis;

  const listener = new RabbitListener();
  await listener.connect(`${RABBITMQ_HOST}?heartbeat=60`);

  queuePrefix = MESSAGE_BROKER_PREFIX || '';

  return {
    consumeQueue,
    consumeRPCQueue,
    sendRPCMessage
  };
};
