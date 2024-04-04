import { ISyncLogModel, loadSyncLogClass } from './models/Dynamic';
import * as mongoose from 'mongoose';
import { ISyncLogDocument } from './models/definitions/dynamic';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  SyncLogs: ISyncLogModel;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.SyncLogs = db.model<ISyncLogDocument, ISyncLogModel>(
    'msdynamics_synclogs',
    loadSyncLogClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
