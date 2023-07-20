import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import { ISyncModel, loadSyncClass } from './models/sync';
import { ISyncDocument } from './models/definitions/sync';

export interface IModels {
  Sync: ISyncModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.Sync = db.model<ISyncDocument, ISyncModel>(
    'synced-saas',
    loadSyncClass(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
