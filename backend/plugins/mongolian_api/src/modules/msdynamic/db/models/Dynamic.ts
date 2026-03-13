import {
  customerRelationSchema,
  syncLogSchema,
} from '~/modules/msdynamic/db/definitions/dynamic';
import {
  ICustomerRelation,
  ICustomerRelationDocument,
  ISyncLog,
  ISyncLogDocument,
} from '~/modules/msdynamic/@types/dynamic';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

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
      return await models.SyncLogs.findOneAndUpdate(
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

export interface ICustomerRelationModel extends Model<ICustomerRelationDocument> {
  customerRelationsAdd(
    doc: ICustomerRelation,
  ): Promise<ICustomerRelationDocument>;
  customerRelationsEdit(
    _id: string,
    doc: ICustomerRelation,
  ): Promise<ICustomerRelationDocument>;
  customerRelationsRemove(_ids: string[]): Promise<JSON>;
}

export const loadCustomerRelationClass = (models: IModels) => {
  class CustomerRelation {
    public static async customerRelationsAdd(doc: ICustomerRelation) {
      return models.CustomerRelations.create({ ...doc });
    }

    public static async customerRelationsEdit(
      _id: string,
      doc: ICustomerRelation,
    ) {
      return await models.CustomerRelations.updateOne(
        { _id },
        { $set: { ...doc } },
      );
    }

    public static async customerRelationsRemove(_ids: string[]) {
      return await models.CustomerRelations.deleteMany({ _id: { $in: _ids } });
    }
  }

  customerRelationSchema.loadClass(CustomerRelation);

  return customerRelationSchema;
};
