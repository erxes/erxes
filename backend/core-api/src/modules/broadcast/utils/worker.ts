import { sendWorkerQueue } from 'erxes-api-shared/utils';

export const addBroadcastWorkerQueue = ({ queueName, data, jobId }) => {
  const queue = sendWorkerQueue('core', queueName);

  queue.add(queueName, data, {
    jobId,
    removeOnComplete: true,
    removeOnFail: true,
  });

  return queue;
};
