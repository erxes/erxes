import { sendWorkerQueue } from 'erxes-api-shared/utils';

export const addBroadcastWorkerQueue = ({
  queueName,
  data,
  jobId,
  delay,
}: {
  queueName: string;
  data: unknown;
  jobId: string;
  /** Milliseconds to hold the job for; used to resume a campaign tomorrow. */
  delay?: number;
}) => {
  const queue = sendWorkerQueue('core', queueName);

  queue.add(queueName, data, {
    jobId,
    delay,
    removeOnComplete: true,
    removeOnFail: true,
  });

  return queue;
};
