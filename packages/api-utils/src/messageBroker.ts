import { debugInfo } from './debuggers';
import { getPluginAddress } from './serviceDiscovery';
import { Express } from 'express';
import fetch from 'node-fetch';
import * as Agent from 'agentkeepalive';
import * as dotenv from 'dotenv';
import * as bullmq from './bullmq';
dotenv.config();

const timeoutMs = Number(process.env.RPC_TIMEOUT) || 30000;

const httpAgentOptions = {
  timeout: timeoutMs,
  keepAliveMsecs: 1000
};

const keepaliveAgent = new Agent(httpAgentOptions);
const secureKeepaliveAgent = new Agent.HttpsAgent(httpAgentOptions);

function getHttpAgent(protocol: string, args: any): Agent | Agent.HttpsAgent {
  if (args.timeout && Number(args.timeout)) {
    const options = { ...httpAgentOptions, timeout: Number(args.timeout) };
    if (protocol === 'http:') {
      return new Agent(options);
    } else {
      return new Agent.HttpsAgent(options);
    }
  } else {
    return protocol === 'http:' ? keepaliveAgent : secureKeepaliveAgent;
  }
}

const showInfoDebug = () => {
  if ((process.env.DEBUG || '').includes('error')) {
    return false;
  }

  return true;
};

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
  await bullmq.consumeQueue(queueName, callback);
};

function splitPluginProcedureName(queueName: string) {
  const separatorIndex = queueName.indexOf(':');

  const pluginName = queueName.slice(0, separatorIndex);
  const procedureName = queueName.slice(separatorIndex + 1);

  return { pluginName, procedureName };
}

export const createConsumeRPCQueue = (app: Express) => (
  queueName,
  procedure
) => {
  const { procedureName } = splitPluginProcedureName(queueName);

  if (procedureName.includes(':')) {
    throw new Error(
      `${procedureName}. RPC procedure name cannot contain : character. Use dot . instead.`
    );
  }

  const endpoint = `/rpc/${procedureName}`;

  app.post(endpoint, async (req, res) => {
    try {
      const response = await procedure(req.body);
      res.json(response);
    } catch (e) {
      res.json({
        status: 'error',
        errorMessage: e.message
      });
    }
  });

  consumeRPCQueueMq(queueName, procedure);
};

export const sendRPCMessage = async (
  queueName: string,
  args: any
): Promise<any> => {
  const { pluginName, procedureName } = splitPluginProcedureName(queueName);
  const address = await getPluginAddress(pluginName);

  if (!address) {
    throw new Error(
      `Plugin ${pluginName} has no address value in service discovery`
    );
  }

  const getData = async () => {
    try {
      const response = await fetch(`${address}/rpc/${procedureName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(args),
        agent: parsedURL => getHttpAgent(parsedURL.protocol, args),
        compress: false
      });

      if (!(200 <= response.status && response.status < 300)) {
        let argsJson = '"cannot stringify"';
        try {
          argsJson = JSON.stringify(args);
        } catch (e) { }

        throw new Error(
          `RPC HTTP error. Status code: ${response.status}. Remote plugin: ${pluginName}. Procedure: ${procedureName}.
            Arguments: ${argsJson}
          `
        );
      }

      const result = await response.json();

      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.errorMessage);
      }
    } catch (e) {
      if (e.code === 'ERR_SOCKET_TIMEOUT') {
        if (args?.defaultValue) {
          return args.defaultValue;
        } else {
          let argsJson = '"cannot stringify"';
          try {
            argsJson = JSON.stringify(args);
          } catch (e) { }

          throw new Error(
            `RPC HTTP timeout after ${timeoutMs}ms. Remote: ${pluginName}. Procedure: ${procedureName}.
              Arguments: ${argsJson}
            `
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
          e.code
        )
      ) {
        const lastTry = tryIdx >= maxTries;
        !lastTry && (await new Promise(resolve => setTimeout(resolve, 3000)));
      } else {
        throw e;
      }
    }
  }
  if (lastError) throw lastError;
};

export const sendRPCMessageMq = async (
  queueName: string,
  message: any
): Promise<any> => {
  queueName = queueName.concat(queuePrefix);

  if (message && !message.thirdService) {
    await checkQueueName(queueName, true);
  }

  if (showInfoDebug()) {
    debugInfo(
      `Sending rpc message ${JSON.stringify(message)} to queue ${queueName}`
    );
  }

  return bullmq.sendRPCMessageMq(queueName, message);
};

export const consumeRPCQueueMq = async (queueName, callback) => {
  queueName = queueName.concat(queuePrefix);

  debugInfo(`consumeRPCQueue ${queueName}`);

  await checkQueueName(queueName);

  return bullmq.consumeRPCQueueMq(queueName, callback);
};

export const sendMessage = async (queueName: string, data?: any) => {
  queueName = queueName.concat(queuePrefix);

  if (data && !data.thirdService) {
    await checkQueueName(queueName, true);
  }

  return bullmq.sendMessage(queueName, data);
};

export const init = async ({
  MESSAGE_BROKER_PREFIX,
  redis,
  app
}) => {
  redisClient = redis;

  queuePrefix = MESSAGE_BROKER_PREFIX || '';

  return {
    consumeQueue,
    consumeRPCQueue: await createConsumeRPCQueue(app),
    sendMessage,
    sendRPCMessage,
    consumeRPCQueueMq,
    sendRPCMessageMq
  };
};
