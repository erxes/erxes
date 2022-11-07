import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IImportHistoryDocument } from './db/models/definitions/importHistory';
import { IExportHistoryDocument } from './db/models/definitions/exportHistory';
import {
  IImportHistoryModel,
  loadImportHistoryClass
} from './db/models/ImportHistory';
import {
  IExportHistoryModel,
  loadExportHistoryClass
} from './db/models/ExportHistory';

export interface IModels {
  ImportHistory: IImportHistoryModel;
  ExportHistory: IExportHistoryModel;
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

  models.ExportHistory = db.model<IExportHistoryDocument, IExportHistoryModel>(
    'export_history',
    loadExportHistoryClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
