import { DefaultJobOptions, Queue, QueueEvents } from 'bullmq';
import { redis } from 'erxes-api-shared/utils';

export async function sendAutomationWorkerMessage<TData, TResult>({
  queueName,
  jobName,
  subdomain,
  data,
  defaultValue,
  timeout = 3000,
  options,
}: {
  queueName: string;
  jobName: string;
  subdomain: string;
  data: TData;
  defaultValue?: TResult;
  timeout?: number;
  options?: DefaultJobOptions;
}): Promise<TResult | undefined> {
  const queueKey = `automations-${queueName}`;
  const queue = new Queue(queueKey, { connection: redis });
  const queueEvents = new QueueEvents(queueKey, { connection: redis });

  const job = await queue.add(
    jobName,
    { subdomain, data },
    { ...(options || {}) },
  );

  try {
    const result = await Promise.race([
      job.waitUntilFinished(queueEvents) as Promise<TResult>,
      new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(`Worker timeout: ${queueKey}/${jobName}/${job.id}`),
            ),
          timeout,
        ),
      ),
    ]);
    return result ?? defaultValue;
  } catch (err) {
    // enrich error, rethrow
    throw err;
  }
}
