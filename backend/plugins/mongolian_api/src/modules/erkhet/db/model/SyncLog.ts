import { Model } from 'mongoose';
import { IModels } from '../../../../connectionResolvers';
import { syncLogSchema, ISyncLog, ISyncLogDocument } from '../definition/syncLog';


export interface ISyncLogModel extends Model<ISyncLogDocument> {
  syncLogsAdd(doc: ISyncLog): Promise<ISyncLogDocument>;
  syncLogsEdit(_id: string, doc: Partial<ISyncLog>): Promise<ISyncLogDocument | null>;
  syncLogsRemove(_ids: string[]): Promise<{ deletedCount?: number }>;
}

export const loadSyncLogClass = (models: IModels) => {
  class SyncLog {

    public static async syncLogsAdd(doc: ISyncLog) {
      const result = await models.SyncLogs.create({
        ...doc,
        createdAt: new Date(),
      });
      return result;
    }

    public static async syncLogEdit(_id: string, doc: Partial<ISyncLog>) {
      await models.SyncLogs.updateOne({ _id }, { $set: { ...doc } });
      return models.SyncLogs.findOne({ _id }).lean();
    }

    public static async syncLogsRemove(_ids: string[]) {
      return await models.SyncLogs.deleteMany({ _id: { $in: _ids } });
    }

  }

  syncLogSchema.loadClass(SyncLog);

  return syncLogSchema;
};
