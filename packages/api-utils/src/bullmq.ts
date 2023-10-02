import { debugError, } from './debuggers';
import { Queue, QueueEvents, isNotConnectionError, Worker } from 'bullmq';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const connectionOptions = {
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || '6379', 10) || 6379,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null
};

const connection = new Redis(connectionOptions);
const eventsConnections = new Redis(connectionOptions);

function getMessageQueue(name: string): Queue {
  const queue = new Queue(name, {
    defaultJobOptions: {
      attempts: 16,
      backoff: {
        type: 'exponential',
        delay: 5,
      },
      removeOnComplete: true,
      removeOnFail: true,
    },
    connection
  });
  return queue;
}

function getRpcQueue(name: string): Queue {
  const queue = new Queue(name, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3,
      },
      removeOnComplete: {
        age: 5
      },
      removeOnFail: true,
    }, connection
  });
  return queue;
}

async function getQueueEvents(name: string): Promise<QueueEvents> {
  const queueEvents = new QueueEvents(name, {
    connection: eventsConnections
  });
  await queueEvents.waitUntilReady();
  return queueEvents;
}

async function cleanupQueue(queue: Queue) {
  try {
    await queue.close();
  } catch (e) {
    debugError(`cleanupQueue: Error ${queue.name}. ${e.message}`);
  }
}
async function cleanupQueueEvents(queueEvents: QueueEvents) {
  try {
    await queueEvents.close();
  } catch (e) {
    debugError(`cleanupQueueEvents: close() error ${queueEvents.name}. ${e.message}`);
  }
}
export async function consumeQueue(queueName: string, callback: any) {
  try {
    new Worker(queueName, async job => {
      try {
        await callback(job.data);
      } catch (e) {
        debugError(
          `consumeQueue: Error occurred during callback ${queueName} ${e.message}`
        );
      }
    }, {
      connection
    });
  } catch (e) {
    debugError(
      `consumeQueue: Error occurred during "new Worker()". ${queueName} ${e.message}`
    );
  }
}


export async function consumeRPCQueueMq(queueName: string, callback: any) {
  try {
    new Worker(queueName, async job => {
      try {
        const result= await callback(job.data);
        return result;
      } catch (e) {
        debugError(
          `consumeRPCQueueMq: Error occurred during callback ${queueName} ${e.message}`
        );
        return {
          status: 'error',
          errorMessage: e.message
        };
      }
    }, {
      connection
    });

  } catch (e) {
    debugError(
      `consumeRPCQueueMq: Error occurred during "new Worker()". ${queueName} ${e.message}`
    );
  }
};

export const sendMessage = async (queueName: string, data: any) => {
  try {
    const queue = getMessageQueue(queueName);
    await queue.add('message', data);
  } catch (e) {
    debugError(`sendMessage: Error occurred ${queueName}. ${e.message}`);
  }
};


export const RPC = async (queueName: string, data: any): Promise<any> => {
  const timeoutMs = data.timeout || Number(process.env.RPC_TIMEOUT) || 30000;
  const queue = getRpcQueue(queueName);
  const queueEvents = await getQueueEvents(queueName);
  const job = await queue.add('RPC', data);

  try {
    const result = await job.waitUntilFinished(queueEvents, timeoutMs);
    await job.remove();
    return result;
  } catch (e) {
    debugError(`sendRPCMessageMq: Error ${queueName}. ${e.message}`);
    if (isNotConnectionError(e) && data.defaultValue) {
      return {
        status: 'success',
        data: data.defaultValue
      };
    } else {
      throw e;
    }
  } finally {
    await cleanupQueueEvents(queueEvents);
    await cleanupQueue(queue);
  }
}

export const sendRPCMessageMq = async (queueName: string, data: any): Promise<any> => {
  const result = await RPC(queueName, data);
  if (result.status === 'success') {
    return result.data;
  } else {
    throw new Error(result.errorMessage);
  }
}