import { debugError, debugInfo } from './debuggers';
import { Queue, QueueEvents, isNotConnectionError, Worker } from 'bullmq';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const showInfoDebug = () => {
  if ((process.env.DEBUG || '').includes('error')) {
    return false;
  }

  return true;
};

const connectionOptions = {
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || '6379', 10) || 6379,
  password: REDIS_PASSWORD
};

const defaultJobOptions = {
  attempts: 4,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: true,
};

const connection = new Redis(connectionOptions);
const eventsConnection = new Redis(connectionOptions);


function getQueue(name) {
  const queue = new Queue(name, {
    defaultJobOptions,
    connection
  });
  return queue;

}


export async function consumeQueue(queueName, callback) {
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
      `consumeQueue: Error occurred ${queueName} ${e.message}`
    );
  }
}


export async function consumeRPCQueueMq(queueName, callback) {
  try {
    new Worker(queueName, async job => {
      try {
        return await callback(job.data);
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
      `consumeRPCQueueMq: Error occurred ${queueName} ${e.message}`
    );
  }
};
