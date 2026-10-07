import { sendWorkerQueue } from 'erxes-api-shared/utils';

// Sending can hold a worker for an hour; deciding takes milliseconds. Shared,
// a campaign timed for 09:00 waited behind whatever was being sent.
export const BROADCAST_QUEUES = {
  SENDING: 'broadcast_processor',
  SCHEDULING: 'broadcast_scheduler',
} as const;

export const addBroadcastWorkerQueue = async ({
  queueName,
  data,
  jobId,
  delay,
}: {
  queueName: string;
  data: unknown;
  jobId: string;
  delay?: number;
}) => {
  const queue = sendWorkerQueue('core', queueName);

  await queue.add(queueName, data, {
    jobId,
    delay,
    removeOnComplete: true,
    removeOnFail: true,
  });

  return queue;
};
