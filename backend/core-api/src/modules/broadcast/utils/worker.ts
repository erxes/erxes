import { sendWorkerQueue } from 'erxes-api-shared/utils';

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
