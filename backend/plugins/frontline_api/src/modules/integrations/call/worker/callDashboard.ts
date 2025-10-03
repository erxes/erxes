import { Queue, Worker, Job } from 'bullmq';
import { sendToGrandStream } from '../utils';
import redis from '../redlock';
import { getEnv, graphqlPubsub } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

interface QueueJobData {
  jobType: 'call-queue-monitor';
}

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: parseInt(process.env.REDIS_DB || '0'),
};

const QUEUE_NAMES = {
  CALL_MONITOR: 'call-queue-monitor',
} as const;

// Job names
const JOB_NAMES = {
  MONITOR_QUEUES: 'monitor-call-queues',
} as const;

function arraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

async function processQueueState(
  queue: string,
  state: 'waiting' | 'talking' | 'agent',
  newData: any,
  pubsubEvent: string,
  comparisonKey?: 'callerid' | 'member',
): Promise<void> {
  if (!newData) {
    return;
  }

  const redisKey = `callRealtimeHistory:${queue}:${state}`;
  const oldHistoryJSON = await redis.get(redisKey);

  if (!oldHistoryJSON) {
    await redis.set(redisKey, JSON.stringify(newData));
    return;
  }

  const oldHistory = JSON.parse(oldHistoryJSON);
  let hasChanged = false;

  if (comparisonKey === 'callerid') {
    const oldIds = (oldHistory.member || [])
      .map((item) => item.callerid)
      .sort();
    const newIds = (newData.member || []).map((item) => item.callerid).sort();
    if (!arraysEqual(oldIds, newIds)) {
      hasChanged = true;
    }
  } else if (comparisonKey === 'member') {
    if (
      JSON.stringify(oldHistory.member || []) !==
      JSON.stringify(newData.member || [])
    ) {
      hasChanged = true;
    }
  }

  await redis.set(redisKey, JSON.stringify(newData));

  const updatedHistory = await redis.get(redisKey);

  graphqlPubsub.publish(pubsubEvent, {
    [pubsubEvent]: JSON.parse(JSON.stringify(updatedHistory) || '{}'),
  });

  // Only publish if there are actual changes to reduce unnecessary events
  // if (hasChanged) {
  //   console.log(hasChanged, 'hasChangedhasChangedhasChanged');
  //   const updatedHistory = await redis.get(redisKey);
  //   graphqlPubsub.publish(pubsubEvent, {
  //     [pubsubEvent]: JSON.parse(updatedHistory || '{}'),
  //   });
  // }
}

async function processCallQueueMonitoring(): Promise<void> {
  if (!getEnv({ name: 'CALL_DASHBOARD_ENABLED' })) {
    console.log('Call monitoring disabled or not in OS version');
    return;
  }

  const models = await generateModels('os');

  const integrations = await models.CallIntegrations.find({
    'queues.0': { $exists: true },
  }).lean();

  console.log(
    `Processing ${integrations.length} integrations for subdomain: os`,
  );

  for (const integration of integrations) {
    if (!integration.queues) continue;

    for (const queue of integration.queues) {
      const baseGrandStreamArgs = {
        method: 'POST' as const,
        headers: { 'Content-Type': 'application/json' },
        integrationId: integration.inboxId,
        isConvertToJson: true,
        isCronRunning: true,
      };

      try {
        const waitingData = await sendToGrandStream(
          models,
          {
            ...baseGrandStreamArgs,
            path: 'api',
            data: {
              request: { action: 'getQueueCalling', extension: queue },
            },
          },
          {},
        );
        await processQueueState(
          queue.toString(),
          'waiting',
          waitingData?.response?.CallQueues,
          'waitingCallReceived',
          'callerid',
        );

        const talkingData = await sendToGrandStream(
          models,
          {
            ...baseGrandStreamArgs,
            path: 'api',
            data: {
              request: {
                action: 'getQueueCalling',
                extension: queue,
                role: 'answer',
              },
            },
          },
          {},
        );
        await processQueueState(
          queue.toString(),
          'talking',
          talkingData?.response?.CallQueues,
          'talkingCallReceived',
          'callerid',
        );

        const agentData = await sendToGrandStream(
          models,
          {
            ...baseGrandStreamArgs,
            path: 'api',
            data: {
              request: {
                action: 'getCallQueuesMemberMessage',
                extension: queue,
              },
            },
          },
          {},
        );
        await processQueueState(
          queue.toString(),
          'agent',
          agentData?.response?.CallQueueMembersMessage,
          'agentCallReceived',
          'member',
        );
      } catch (error) {
        console.error(
          `[BullMQ Worker] Failed to process queue ${queue} for integration ${integration.inboxId}:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    }
  }
}

export async function initializeCallQueueMonitoring(): Promise<{
  queue: Queue;
  worker: Worker;
}> {
  const callMonitorQueue = new Queue<QueueJobData>(QUEUE_NAMES.CALL_MONITOR, {
    connection: redisConnection,
    defaultJobOptions: {
      removeOnComplete: 5,
      removeOnFail: 10,
      attempts: 1,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  });

  await callMonitorQueue.upsertJobScheduler(
    `${JOB_NAMES.MONITOR_QUEUES}-${'os'}`,
    {
      every: 3000,
    },
    {
      name: JOB_NAMES.MONITOR_QUEUES,
      data: {
        jobType: 'call-queue-monitor',
      },
      opts: {
        priority: 1,
      },
    },
  );

  const worker = new Worker<QueueJobData>(
    QUEUE_NAMES.CALL_MONITOR,
    async (job: Job<QueueJobData>) => {
      const startTime = Date.now();

      try {
        console.log(
          `[BullMQ Worker] Processing job ${job.id} for subdomain: os`,
        );

        await processCallQueueMonitoring();

        const processingTime = Date.now() - startTime;
        console.log(
          `[BullMQ Worker] Job ${job.id} completed in ${processingTime}ms`,
        );

        return {
          success: true,
          processingTime,
        };
      } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(
          `[BullMQ Worker] Job ${job.id} failed after ${processingTime}ms:`,
          error,
        );
        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 2,
      limiter: {
        max: 10,
        duration: 1000,
      },
    },
  );

  worker.on('completed', (job: Job<QueueJobData>, result: any) => {
    console.log(
      `[BullMQ Worker] Job ${job.id} completed successfully:`,
      result,
    );
  });

  worker.on('failed', (job: Job<QueueJobData> | undefined, err: Error) => {
    console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err: Error) => {
    console.error('[BullMQ Worker] Worker error:', err);
  });

  worker.on('stalled', (jobId: string) => {
    console.warn(`[BullMQ Worker] Job ${jobId} stalled`);
  });

  process.on('SIGINT', async () => {
    console.log('[BullMQ] Shutting down gracefully...');
    await worker.close();
    await callMonitorQueue.close();
    process.exit(0);
  });

  console.log(`[BullMQ] Call queue monitoring initialized for subdomain: os`);

  return {
    queue: callMonitorQueue,
    worker,
  };
}

export async function triggerCallQueueMonitoring(): Promise<Job<QueueJobData>> {
  const queue = new Queue<QueueJobData>(QUEUE_NAMES.CALL_MONITOR, {
    connection: redisConnection,
  });

  return await queue.add(
    JOB_NAMES.MONITOR_QUEUES,
    {
      jobType: 'call-queue-monitor',
    },
    {
      priority: 10,
    },
  );
}

export async function getCallQueueMetrics(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const queue = new Queue(QUEUE_NAMES.CALL_MONITOR, {
    connection: redisConnection,
  });

  const waiting = await queue.getWaiting();
  const active = await queue.getActive();
  const completed = await queue.getCompleted();
  const failed = await queue.getFailed();
  const delayed = await queue.getDelayed();

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    delayed: delayed.length,
  };
}

export const callQueueService = {
  processCallQueueMonitoring,
  processQueueState,
  arraysEqual,
};
