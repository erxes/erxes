import * as amqplib from 'amqplib';
import { v4 as uuid } from 'uuid';
import { debugBase, debugError } from './debugger';

let channel;
let queuePrefix;
let counter = 0;

export const consumeQueue = async (queueName, callback) => {
  queueName = queueName.concat(queuePrefix);

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
  debugBase(`consumeRPCQueue ${queueName}`);

  queueName = queueName.concat(queuePrefix);

  try {
    debugBase(`consumeRPCQueue: before assertQueue ${queueName}`);

    await channel.assertQueue(queueName);

    debugBase(`consumeRPCQueue: before prefetch ${queueName}`);

    // TODO: learn more about this
    // await channel.prefetch(10);

    debugBase(`consumeRPCQueue: before consume ${queueName}`);

    channel.consume(queueName, async msg => {
      if (msg !== null) {
        debugBase(`Received rpc queue message ${msg.content.toString()}`);

        try {
          const response = await callback(JSON.parse(msg.content.toString()));

          debugBase(`Before sendToQueue`);

          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            {
              correlationId: msg.properties.correlationId
            }
          );

          debugBase(`After sendToQueue`);
        } catch (e) {
          debugError(
            `Error occurred during callback ${queueName} ${e.message}`
          );
        }

        debugBase(`Before channel.ack`);

        channel.ack(msg);

        debugBase(`After channel.ack`);
      }
    });

    debugBase(`consumeRPCQueue: after consume ${queueName}`);
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

  debugBase(
    `Sending rpc message ${JSON.stringify(message)} to queue ${queueName}`
  );

  const response = await new Promise((resolve, reject) => {
    const correlationId = uuid();

    debugBase(`Before assertQueue to queue ${queueName}`);

    return channel.assertQueue('', { exclusive: true }).then(q => {
      debugBase(`Before consume ${queueName}`);

      channel.consume(
        q.queue,
        msg => {
          debugBase(`Inside consume ${queueName}`);

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

            debugBase(`Before delete queue ${queueName}`);

            channel.deleteQueue(q.queue);
          }
        },
        { noAck: true }
      );

      debugBase(`Before sendToQueue ${queueName}`);

      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: q.queue
      });

      debugBase(`After sendToQueue ${queueName}`);
    });
  });

  return response;
};

export const sendMessage = async (queueName: string, data?: any) => {
  queueName = queueName.concat(queuePrefix);

  try {
    const message = JSON.stringify(data || {});

    debugBase(`Sending message ${message} to ${queueName}`);

    await channel.assertQueue(queueName);
    await channel.sendToQueue(queueName, Buffer.from(message));
  } catch (e) {
    debugError(`Error occurred during send queue ${queueName} ${e.message}`);
  }
};

const reconnector = async ({
  RABBITMQ_HOST,
  prefix,
  closed = false,
  error = ''
}) => {
  const msg = closed
    ? 'Reconnect RMQ cause closed...'
    : 'Cant connected RMQ...';
  console.log(`${msg}, ${counter}, ${error ? `ERROR: ${error}` : ''}`);
  counter += 1;

  setTimeout(async () => {
    await init(RABBITMQ_HOST, prefix);
  }, 60000); // 1min wait
};

export const init = async (RABBITMQ_HOST, prefix) => {
  let connection;

  try {
    connection = await amqplib.connect(RABBITMQ_HOST, { noDelay: true });
  } catch (e) {
    await reconnector({ RABBITMQ_HOST, prefix, error: e.message });
  }

  if (connection) {
    channel = await connection.createChannel();
    queuePrefix = prefix;
    console.log('Connected RMQ');

    connection.on('close', async () => {
      await reconnector({ RABBITMQ_HOST, prefix, closed: true });
    });
  }
};

// copy from erxes-message-broker/rabbitmq.ts
