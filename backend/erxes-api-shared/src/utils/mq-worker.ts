import { Queue, QueueEvents, Worker } from 'bullmq';
import type { Redis } from 'ioredis';
import type { DefaultJobOptions, Job, Worker as WorkerType } from 'bullmq';
import { redis } from './redis';

const queueMap = new Map<string, Queue>();
const queueEventsMap = new Map<string, QueueEvents>();

export const createMQWorkerWithListeners = (
  service: string,
  queueName: string,
  processor: (job: Job) => Promise<any>,
  redis: Redis,
  onReady: () => void,
): WorkerType => {
  const worker = new Worker(`${service}-${queueName}`, processor, {
    connection: redis,
  });

  // Default event listeners
  worker.on('completed', (job) => {
    console.log(
      `[Worker] Job ${job.id} in queue '${service}-${queueName}' completed successfully`,
    );
  });

  worker.on('failed', (job, err) => {
    console.error(
      `[Worker] Job ${job?.id} in queue '${service}-${queueName}' failed with error: ${err.message}`,
    );
  });

  worker.on('error', (err) => {
    console.error(
      `[Worker] Error in worker for queue '${service}-${queueName}': ${err.message}`,
    );
  });

  worker.on('ready', () => {
    console.log(`[Worker] Worker for queue '${service}-${queueName}' is ready`);
    onReady();
  });

  return worker;
};

export const sendWorkerQueue = (serviceName: string, queueName: string) =>
  new Queue(`${serviceName}-${queueName}`, {
    connection: redis,
  });

export const sendWorkerMessage = async ({
  pluginName,
  queueName,
  jobName,
  subdomain,
  data,
  defaultValue,
  timeout = 3000,
  options,
}: {
  pluginName: string;
  queueName: string;
  jobName: string;
  subdomain: string;
  data: any;
  defaultValue?: any;
  timeout?: number;
  options?: DefaultJobOptions;
}) => {
  const queueKey = `${pluginName}-${queueName}`;

  // Get or create the Queue instance
  let queue = queueMap.get(queueKey);
  if (!queue) {
    queue = new Queue(queueKey, { connection: redis });
    queueMap.set(queueKey, queue);
  }

  // Get or create the QueueEvents instance
  let queueEvents = queueEventsMap.get(queueKey);
  if (!queueEvents) {
    queueEvents = new QueueEvents(queueKey, { connection: redis });
    await queueEvents.waitUntilReady(); // Only need to wait on first init
    queueEventsMap.set(queueKey, queueEvents);
  }

  const job = await queue.add(
    jobName,
    { subdomain, data },
    { ...(options || {}) },
  );
  const result = await Promise.race([
    job.waitUntilFinished(queueEvents),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Worker timeout')), timeout),
    ),
  ]).catch((err) => {
    throw err;
  });

  return result || defaultValue;
};
