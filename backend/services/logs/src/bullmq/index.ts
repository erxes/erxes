import { activityLogWorker } from './activityLogs/activityLogWorker';
import { eventLogWorker } from './eventLogs/eventLogWorker';

export const initMQWorkers = async (redis: any) => {
  console.info('Starting worker log ...');

  console.info('Initialized databases');
  return await Promise.all([eventLogWorker(), activityLogWorker()]);
};
