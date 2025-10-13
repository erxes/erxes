import { Model } from 'mongoose';

import { ICallQueueStatisticsDocuments } from '@/integrations/call/@types/queueStatistics';
import { queueStatisticsSchema } from '@/integrations/call/db/definitions/queueStatistics';

export interface ICallQueueStatisticsModel
  extends Model<ICallQueueStatisticsDocuments> {}

export const loadCallQueueClass = () => {
  class CallQueueStatistics {}

  queueStatisticsSchema.loadClass(CallQueueStatistics);

  return queueStatisticsSchema;
};
