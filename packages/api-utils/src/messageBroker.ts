import * as amqplib from 'amqplib';
import { v4 as uuid } from 'uuid';
import { debugError, debugInfo } from './debuggers';
import { getPluginAddress } from './serviceDiscovery';
import app from './app';
import fetch from 'node-fetch';
import redis from './redis';
import * as Agent from 'agentkeepalive';
import * as dotenv from 'dotenv';
import { Response } from 'express';
dotenv.config();

const { RABBITMQ_HOST, MESSAGE_BROKER_PREFIX } = process.env;
const timeoutMs = Number(process.env.RPC_TIMEOUT) || 30000;

const httpAgentOptions = {
  timeout: timeoutMs,
  keepAliveMsecs: 1000,
};

const keepaliveAgent = new Agent(httpAgentOptions);

function getHttpAgent(args: any): Agent | Agent.HttpsAgent {
  if (args.timeout && Number(args.timeout)) {
    const options = { ...httpAgentOptions, timeout: Number(args.timeout) };
    return new Agent(options);
  } else {
    return keepaliveAgent;
  }
}

export interface InterMessage {
  subdomain: string;
  data?: any;
  timeout?: number;
  defaultValue?: any;
  thirdService?: boolean;
}

const showInfoDebug = () => {
  if ((process.env.DEBUG || '').includes('error')) {
    return false;
  }

  return true;
};

let channel: amqplib.Channel | undefined;
const queuePrefix = MESSAGE_BROKER_PREFIX || '';

const checkQueueName = async (queueName, isSend = false) => {
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

export const doesQueueExist = async (
  serviceName: string,
  action: string,
): Promise<boolean> => {
  const isMember = await redis.sismember(
    `service:queuenames:${serviceName}`,
    action,
  );

  return isMember !== 0;
};

type ConsumeHandler = (message: InterMessage, msg: amqplib.Message) => any;

export const consumeQueue = async (queueName, handler: ConsumeHandler) => {
  if (!channel) {
    throw new Error(`RabbitMQ channel is ${channel}`);
  }
  queueName = queueName.concat(queuePrefix);

  debugInfo(`consumeQueue ${queueName}`);

  await checkQueueName(queueName);

  await channel.assertQueue(queueName);

  // TODO: learn more about this
  // await channel.prefetch(10);

  try {
    channel.consume(
      queueName,
      async (msg) => {
        if (msg !== null) {
          try {
            await handler(JSON.parse(msg.content.toString()), msg);
          } catch (e) {
            debugError(
              `Error occurred during callback ${queueName} ${e.message}`,
            );
          }
          if (!channel) {
            throw new Error(`RabbitMQ channel is ${channel}`);
          }
          channel.ack(msg);
        }
      },
      { noAck: false },
    );
  } catch (e) {
    debugError(
      `Error occurred during consumeq queue ${queueName} ${e.message}`,
    );
  }
};

function splitPluginProcedureName(queueName: string) {
  const separatorIndex = queueName.indexOf(':');

  const pluginName = queueName.slice(0, separatorIndex);
  const procedureName = queueName.slice(separatorIndex + 1);

  return { pluginName, procedureName };
}

export interface RPSuccess {
  status: 'success';
  data?: any;
}
export interface RPError {
  status: 'error';
  errorMessage: string;
}
export type RPResult = RPSuccess | RPError;
export type RP = (params: InterMessage) => RPResult | Promise<RPResult>;

const httpRpcEndpointSetup = {};
export const consumeRPCQueue = async (
  queueName,
  procedure: RP,
): Promise<void> => {
  const { procedureName } = splitPluginProcedureName(queueName);

  if (procedureName.includes(':')) {
    throw new Error(
      `${procedureName}. RPC procedure name cannot contain : character. Use dot . instead.`,
    );
  }

  if (!httpRpcEndpointSetup[queueName]) {
    const endpoint = `/rpc/${procedureName}`;

    app.post(endpoint, async (req, res: Response<RPResult>) => {
      try {
        const response = await procedure(req.body);
        res.json(response);
      } catch (e) {
        res.json({
          status: 'error',
          errorMessage: e.message,
        });
      }
    });
    httpRpcEndpointSetup[queueName] = true;
  }

  await consumeRPCQueueMq(queueName, procedure);
};

export const sendRPCMessage = async (
  queueName: string,
  message: InterMessage,
): Promise<any> => {
  const { pluginName, procedureName } = splitPluginProcedureName(queueName);
  const address = await getPluginAddress(pluginName);

  if (!address) {
    throw new Error(
      `Plugin ${pluginName} has no address value in service discovery`,
    );
  }

  const getData = async () => {
    try {
      const agent = getHttpAgent(message);
      const response = await fetch(`${address}/rpc/${procedureName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
        agent,
        compress: false,
      });

      if (!response.ok) {
        let argsJson = '"cannot stringify"';
        try {
          argsJson = JSON.stringify(message);
        } catch (e) {}

        throw new Error(
          `RPC HTTP error. Status code: ${response.status}. Remote plugin: ${pluginName}. Procedure: ${procedureName}.
            Arguments: ${argsJson}
          `,
        );
      }

      const result: RPResult = await response.json();

      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.errorMessage);
      }
    } catch (e) {
      if (e.code === 'ERR_SOCKET_TIMEOUT') {
        if (message?.defaultValue) {
          return message.defaultValue;
        } else {
          let argsJson = '"cannot stringify"';
          try {
            argsJson = JSON.stringify(message);
          } catch (e) {}

          throw new Error(
            `RPC HTTP timeout after ${timeoutMs}ms. Remote: ${pluginName}. Procedure: ${procedureName}.
              Arguments: ${argsJson}
            `,
          );
        }
      }

      throw e;
    }
  };

  let lastError = null;
  const maxTries = 3;
  for (let tryIdx = 1; tryIdx <= maxTries; tryIdx++) {
    try {
      const data = await getData();
      return data;
    } catch (e) {
      lastError = e;
      if (
        e.code &&
        ['ECONNREFUSED', 'ECONNRESET', 'ERR_STREAM_PREMATURE_CLOSE'].includes(
          e.code,
        )
      ) {
        const lastTry = tryIdx >= maxTries;
        !lastTry && (await new Promise((resolve) => setTimeout(resolve, 3000)));
      } else {
        throw e;
      }
    }
  }
  if (lastError) throw lastError;
};

export const sendRPCMessageMq = async (
  queueName: string,
  message: InterMessage,
): Promise<any> => {
  if (!channel) {
    throw new Error(`RabbitMQ channel is ${channel}`);
  }

  queueName = queueName.concat(queuePrefix);

  if (message && !message.thirdService) {
    await checkQueueName(queueName, true);
  }

  if (showInfoDebug()) {
    debugInfo(
      `Sending rpc message ${JSON.stringify(message)} to queue ${queueName}`,
    );
  }

  const response = await new Promise<any>((resolve, reject) => {
    if (!channel) {
      throw new Error(`RabbitMQ channel is ${channel}`);
    }
    const correlationId = uuid();

    return channel.assertQueue('', { exclusive: true }).then((q) => {
      const timeoutMs =
        message.timeout || Number(process.env.RPC_TIMEOUT) || 10000;
      var interval = setTimeout(() => {
        if (!channel) {
          throw new Error(`RabbitMQ channel is ${channel}`);
        }
        channel.deleteQueue(q.queue);

        clearInterval(interval);

        debugError(`${queueName} ${JSON.stringify(message)} timedout`);

        return resolve(message.defaultValue);
      }, timeoutMs);

      if (!channel) {
        throw new Error(`RabbitMQ channel is ${channel}`);
      }

      channel.consume(
        q.queue,
        (msg) => {
          if (!channel) {
            throw new Error(`RabbitMQ channel is ${channel}`);
          }
          clearInterval(interval);

          if (!msg) {
            channel.deleteQueue(q.queue).catch(() => {});
            return resolve(message?.defaultValue);
          }

          if (msg.properties.correlationId === correlationId) {
            const res: RPResult = JSON.parse(msg.content.toString());

            if (res.status === 'success') {
              if (showInfoDebug()) {
                debugInfo(
                  `RPC success response for queue ${queueName} ${JSON.stringify(
                    res,
                  )}`,
                );
              }

              resolve(res.data);
            } else {
              debugInfo(
                `RPC error response for queue ${queueName} ${res.errorMessage})}`,
              );

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
        expiration: timeoutMs,
      });
    });
  });

  return response;
};

export const consumeRPCQueueMq = async (
  queueName,
  callback: RP,
): Promise<void> => {
  if (!channel) {
    throw new Error(`RabbitMQ channel is ${channel}`);
  }

  queueName = queueName.concat(queuePrefix);

  debugInfo(`consumeRPCQueue ${queueName}`);

  await checkQueueName(queueName);

  try {
    await channel.assertQueue(queueName);

    // TODO: learn more about this
    // await channel.prefetch(10);

    channel.consume(queueName, async (msg) => {
      if (!channel) {
        throw new Error(`RabbitMQ channel is ${channel}`);
      }

      if (msg !== null) {
        if (showInfoDebug()) {
          debugInfo(
            `Received rpc ${queueName} queue message ${msg.content.toString()}`,
          );
        }

        let response: RPResult;

        try {
          response = await callback(JSON.parse(msg.content.toString()));
        } catch (e) {
          debugError(
            `Error occurred during callback ${queueName} ${e.message}`,
          );

          response = {
            status: 'error',
            errorMessage: e.message,
          };
        }

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(response)),
          {
            correlationId: msg.properties.correlationId,
          },
        );

        channel.ack(msg);
      }
    });
  } catch (e) {
    debugError(
      `Error occurred during consume rpc queue ${queueName} ${e.message}`,
    );
  }
};

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

export type SetupMessageConsumers = () => any;

export const connectToMessageBroker = async (
  setupMessageConsumers?: SetupMessageConsumers,
) => {
  const con = await amqplib.connect(`${RABBITMQ_HOST}?heartbeat=60`, {
    noDelay: true,
  });
  con.once('close', (error) => {
    con.removeAllListeners();
    if (error) {
      console.error('RabbitMQ: connections is closing due to an error:', error);
      reconnectToMessageBroker(setupMessageConsumers);
    } else {
      console.log('RabbitMQ: connection is closing.');
    }
  });
  con.on('error', async (e) => {
    console.error('RabbitMQ: connection error:', e);
  });

  channel = await con.createChannel();
  if (setupMessageConsumers) {
    await setupMessageConsumers();
    console.log('RabbitMQ: Finished setting up message consumers');
  }
  console.log(`RabbitMQ connected to ${RABBITMQ_HOST}`);
};

export const reconnectToMessageBroker = async (
  setupMessageConsumers?: SetupMessageConsumers,
) => {
  channel = undefined;
  let reconnectInterval = 5000;
  while (true) {
    try {
      console.log(`RabbitMQ: Trying to reconnect to ${RABBITMQ_HOST}`);
      await connectToMessageBroker(setupMessageConsumers);
      break;
    } catch (e) {
      console.error(
        `RabbitMQ: Error occured while reconnecting to ${RABBITMQ_HOST}. Trying again in ${
          reconnectInterval / 1000
        }s`,
        e,
      );
      await new Promise<void>((resolve) =>
        setTimeout(resolve, reconnectInterval),
      );
      reconnectInterval = reconnectInterval * 2;
    }
  }
};
