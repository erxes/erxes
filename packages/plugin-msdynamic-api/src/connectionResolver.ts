import { ISyncLogModel, loadSyncLogClass } from './models/Dynamic';
import * as mongoose from 'mongoose';
import { ISyncLogDocument } from './models/definitions/dynamic';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  SyncLogs: ISyncLogModel;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.SyncLogs = db.model<ISyncLogDocument, ISyncLogModel>(
    'msdynamics_synclogs',
    loadSyncLogClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
