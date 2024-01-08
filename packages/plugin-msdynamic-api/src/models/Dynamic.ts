import {
  ISyncLog,
  ISyncLogDocument,
  syncLogSchema
} from './definitions/dynamic';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IUser } from '@erxes/api-utils/src/types';

export interface ISyncLogModel extends Model<ISyncLogDocument> {
  createMsdynamicConfig(args: ISyncLog): Promise<ISyncLogDocument>;
  updateMsdynamicConfig(args: ISyncLog, user: IUser): Promise<ISyncLogDocument>;
}

export const loadSyncLogClass = (model: IModels) => {
  class Msdynamic {
    // create
    public static async createMsdynamicConfig(doc: ISyncLog) {
      return await model.SyncLogs.create({
        ...doc,
        createdAt: new Date()
      });
    }
  }

  syncLogSchema.loadClass(Msdynamic);

  return syncLogSchema;
};
