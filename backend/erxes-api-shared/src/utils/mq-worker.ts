import type {
  DefaultJobOptions,
  Job,
  JobsOptions,
  Worker as WorkerType,
  WorkerOptions,
} from 'bullmq';
import { Queue, QueueEvents, Worker } from 'bullmq';
import type { Redis } from 'ioredis';
import { redis } from './redis';

const queueMap = new Map<string, Queue>();
const queueEventsMap = new Map<string, QueueEvents>();


export const toSerializablePayload = <T>(payload: T): T => {
  if (typeof payload === 'undefined') {
    return payload;
  }

  const seen = new WeakSet<object>();

  return JSON.parse(
    JSON.stringify(payload, (_key, value) => {
      if (typeof value !== 'object' || value === null) {
        return value;
      }

      if (seen.has(value)) {
        return undefined;
      }

      seen.add(value);
      return value;
    }),
  );
};

const makeQueueSerializable = (queue: Queue) => {
  const serializableQueue = queue as Queue & {
    isSerializableAddWrapped?: boolean;
  };

  if (serializableQueue.isSerializableAddWrapped) {
    return serializableQueue;
  }

  const add = serializableQueue.add.bind(serializableQueue);

  serializableQueue.add = ((
    name: string,
    data?: unknown,
    opts?: JobsOptions,
  ) => add(name, toSerializablePayload(data), opts)) as Queue['add'];
  serializableQueue.isSerializableAddWrapped = true;

  return serializableQueue;
};

export const createMQWorkerWithListeners = (
  service: string,
  queueName: string,
  processor: (job: Job) => Promise<any>,
  redis: Redis,
  onReady: () => void,
  workerOptions: Omit<WorkerOptions, 'connection'> = {},
): WorkerType => {
  const worker = new Worker(`${service}-${queueName}`, processor, {
    connection: redis,
    ...workerOptions,
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

export const sendWorkerQueue = (serviceName: string, queueName: string) => {
  const queueKey = `${serviceName}-${queueName}`;
  let queue = queueMap.get(queueKey);

  if (!queue) {
    queue = new Queue(queueKey, { connection: redis });
    makeQueueSerializable(queue);
    queueMap.set(queueKey, queue);
  }

  return queue;
};

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
    makeQueueSerializable(queue);
    queueMap.set(queueKey, queue);
  }

  // Get or create the QueueEvents instance
  let queueEvents = queueEventsMap.get(queueKey);
  if (!queueEvents) {
    queueEvents = new QueueEvents(queueKey, { connection: redis });
    await queueEvents.waitUntilReady(); // Only need to wait on first init
    queueEventsMap.set(queueKey, queueEvents);
  }

  const jobData = toSerializablePayload({ subdomain, data });
  const job = await queue.add(jobName, jobData, { ...options });
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
