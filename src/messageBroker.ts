import * as amqplib from 'amqplib';
import * as dotenv from 'dotenv';
import * as uuid from 'uuid';
import {
  receiveEmailVerifierNotification,
  receiveEngagesNotification,
  receiveIntegrationsNotification,
  receiveRpcMessage,
} from './data/modules/integrations/receiveMessage';
import { RobotEntries } from './db/models';
import { debugBase } from './debuggers';
import { graphqlPubsub } from './pubsub';

dotenv.config();

const { NODE_ENV, RABBITMQ_HOST = 'amqp://localhost' } = process.env;

let connection;
let channel;

export const sendRPCMessage = async (queueName: string, message: any): Promise<any> => {
  debugBase(`Sending rpc message ${JSON.stringify(message)} to queue ${queueName}`);

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
              resolve(res.data);
            } else {
              reject(new Error(res.errorMessage));
            }

            channel.deleteQueue(q.queue);
          }
        },
        { noAck: true },
      );

      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: q.queue,
      });
    });
  });

  return response;
};

export const sendMessage = async (queueName: string, data?: any) => {
  if (NODE_ENV === 'test') {
    return;
  }

  debugBase(`Sending message to ${queueName}`);

  await channel.assertQueue(queueName);
  await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data || {})));
};

export const initRabbitMQ = async () => {
  // Consumer
  connection = await amqplib.connect(RABBITMQ_HOST);
  channel = await connection.createChannel();
};

export const initConsumer = async () => {
  await initRabbitMQ();

  // listen for rpc queue =========
  await channel.assertQueue('rpc_queue:integrations_to_api');

  channel.consume('rpc_queue:integrations_to_api', async msg => {
    if (msg !== null) {
      debugBase(`Received rpc queue message ${msg.content.toString()}`);

      const response = await receiveRpcMessage(JSON.parse(msg.content.toString()));

      channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
        correlationId: msg.properties.correlationId,
      });

      channel.ack(msg);
    }
  });

  // graphql subscriptions call =========
  await channel.assertQueue('callPublish');

  channel.consume('callPublish', async msg => {
    if (msg !== null) {
      const params = JSON.parse(msg.content.toString());

      graphqlPubsub.publish(params.name, params.data);

      channel.ack(msg);
    }
  });

  // listen for integrations api =========
  await channel.assertQueue('integrationsNotification');

  channel.consume('integrationsNotification', async msg => {
    if (msg !== null) {
      await receiveIntegrationsNotification(JSON.parse(msg.content.toString()));
      channel.ack(msg);
    }
  });

  // listen for email verifier notification ===========
  await channel.assertQueue('emailVerifierNotification');

  channel.consume('emailVerifierNotification', async msg => {
    if (msg !== null) {
      debugBase(`Received email verifier notification ${msg.content.toString()}`);

      await receiveEmailVerifierNotification(JSON.parse(msg.content.toString()));

      channel.ack(msg);
    }
  });

  // listen for engage notification ===========
  await channel.assertQueue('engagesNotification');

  channel.consume('engagesNotification', async msg => {
    if (msg !== null) {
      debugBase(`Received engages notification ${msg.content.toString()}`);

      await receiveEngagesNotification(JSON.parse(msg.content.toString()));

      channel.ack(msg);
    }
  });

  // listen for spark notification  =========
  await channel.assertQueue('sparkNotification');

  channel.consume('sparkNotification', async msg => {
    if (msg !== null) {
      debugBase(`Received spark notification ${msg.content.toString()}`);

      const data = JSON.parse(msg.content.toString());

      delete data.subdomain;

      RobotEntries.createEntry(data)
        .then(() => debugBase('success'))
        .catch(e => debugBase(e.message));

      channel.ack(msg);
    }
  });
};
