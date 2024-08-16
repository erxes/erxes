import { ICustomerRelationModel, ISyncLogModel, loadCustomerRelationClass, loadSyncLogClass } from './models/Dynamic';
import * as mongoose from 'mongoose';
import { ICustomerRelationDocument, ISyncLogDocument } from './models/definitions/dynamic';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  SyncLogs: ISyncLogModel;
  CustomerRelations: ICustomerRelationModel
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.SyncLogs = db.model<ISyncLogDocument, ISyncLogModel>(
    'msdynamics_synclogs',
    loadSyncLogClass(models),
  );

  models.CustomerRelations = db.model<ICustomerRelationDocument, ICustomerRelationModel>(
    'msdynamics_customer_relation',
    loadCustomerRelationClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
