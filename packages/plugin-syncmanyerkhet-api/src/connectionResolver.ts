import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { ISyncLogDocument } from './models/definitions/syncLog';
import { ISyncLogModel, loadSyncLogClass } from './models/SyncLog';
import { IConfigModel, loadConfigClass } from './models/Configs';
import { IConfigDocument } from './models/definitions/configs';

export interface IModels {
  Configs: IConfigModel;
  SyncLogs: ISyncLogModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'syncerkhet_configs',
    loadConfigClass(models)
  );

  models.SyncLogs = db.model<ISyncLogDocument, ISyncLogModel>(
    'syncerkhet_synclogs',
    loadSyncLogClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
