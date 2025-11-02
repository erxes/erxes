import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { syncLogSchema } from '../definition/syncLog';

import { ISyncLog, ISyncLogDocument } from '@/erkhet/@types/syncLog';

export interface ISyncLogModel extends Model<ISyncLogDocument> {
  syncLogsAdd(doc: ISyncLog): Promise<ISyncLogDocument>;
  syncLogsEdit(
    _id: string,
    doc: Partial<ISyncLog>,
  ): Promise<ISyncLogDocument | null>;
  syncLogsRemove(_ids: string[]): Promise<{ deletedCount?: number }>;
}

export const loadSyncLogClass = (models: IModels) => {
  class SyncLog {
    public static async syncLogsAdd(doc: ISyncLog) {
      return await models.SyncLogs.create(doc);
    }

    public static async syncLogEdit(_id: string, doc: Partial<ISyncLog>) {
      return models.SyncLogs.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
        { new: true },
      );
    }

    public static async syncLogsRemove(_ids: string[]) {
      return await models.SyncLogs.deleteMany({ _id: { $in: _ids } });
    }
  }

  syncLogSchema.loadClass(SyncLog);

  return syncLogSchema;
};
