import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IImportHistoryDocument } from './db/models/definitions/importHistory';
import {
  IImportHistoryModel,
  loadImportHistoryClass
} from './db/models/ImportHistory';

export interface IModels {
  ImportHistory: IImportHistoryModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  serverTiming: any;
  scopeBrandIds: string[];
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.ImportHistory = db.model<IImportHistoryDocument, IImportHistoryModel>(
    'import_history',
    loadImportHistoryClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
