import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  syncLogSchema,
  ISyncLog,
  ISyncLogDocument
} from './definitions/syncLog';

export interface ISyncLogModel extends Model<ISyncLogDocument> {
  syncLogsAdd(doc: ISyncLog): Promise<ISyncLogDocument>;
  syncLogsEdit(_id: string, doc: ISyncLog): Promise<ISyncLogDocument>;
  syncLogsRemove(_ids: string[]): Promise<JSON>;
}

export const loadSyncLogClass = (models: IModels) => {
  class SyncLog {
    public static async syncLogsAdd(doc: ISyncLog) {
      return models.SyncLogs.create({ ...doc });
    }

    public static async syncLogsEdit(_id: string, doc: ISyncLog) {
      return await models.SyncLogs.updateOne({ _id }, { $set: { ...doc } });
    }

    public static async syncLogsRemove(_ids: string[]) {
      return await models.SyncLogs.deleteMany({ _id: { $in: _ids } });
    }
  }

  syncLogSchema.loadClass(SyncLog);

  return syncLogSchema;
};
