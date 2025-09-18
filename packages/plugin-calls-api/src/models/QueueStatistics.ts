import { Model } from 'mongoose';
import {
  ICallQueueStatisticsDocuments,
  queueStatisticsSchema,
} from './definitions/queueStatistics';

export interface ICallQueueStatisticsModel
  extends Model<ICallQueueStatisticsDocuments> {}

export const loadCallQueueClass = () => {
  class CallQueueStatistics {}

  queueStatisticsSchema.loadClass(CallQueueStatistics);

  return queueStatisticsSchema;
};
