import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { Express } from 'express';
import { BROADCAST_QUEUES } from '../utils/worker';
import { broadcastProcessor } from './broadcast';

// One, as it always was — now a number somebody chose rather than a queue
// default. Raising it without a rate limit only pushes harder on the provider.
const SEND_CONCURRENCY = Number(process.env.BROADCAST_SEND_CONCURRENCY) || 1;

/** Alarms are short, and several tenants' can come due in the same second. */
const SCHEDULE_CONCURRENCY =
  Number(process.env.BROADCAST_SCHEDULE_CONCURRENCY) || 5;

const startedWorkers = new Set<string>();

// One dispatcher for both queues: it reads the job, not the queue, so alarms
// already waiting on the old one are still understood.
const startWorker = (queueName: string, concurrency: number) => {
  if (startedWorkers.has(queueName)) {
    return;
  }

  createMQWorkerWithListeners(
    'core',
    queueName,
    broadcastProcessor,
    redis,
    () => {
      console.log(`Worker for queue ${queueName} is ready`);
    },
    { concurrency },
  );

  startedWorkers.add(queueName);
};

export const startBroadcastWorker = async (app: Express) => {
  startWorker(BROADCAST_QUEUES.SENDING, SEND_CONCURRENCY);
  startWorker(BROADCAST_QUEUES.SCHEDULING, SCHEDULE_CONCURRENCY);
};
