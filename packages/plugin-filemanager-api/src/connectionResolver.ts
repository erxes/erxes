import * as mongoose from 'mongoose';
import {
  IFolderModel,
  loadFolderClass,
  IFolderDocument,
  IFileModel,
  IFileDocument,
  loadFileClass,
  ILogModel,
  ILogDocument,
  loadLogClass
} from './models';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Folders: IFolderModel;
  Files: IFileModel;
  Logs: ILogModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  _subdomain: string
): IModels => {
  models = {} as IModels;

  models.Folders = db.model<IFolderDocument, IFolderModel>(
    'filemanager_folders',
    loadFolderClass(models)
  );

  models.Files = db.model<IFileDocument, IFileModel>(
    'filemanager_files',
    loadFileClass(models)
  );

  models.Logs = db.model<ILogDocument, ILogModel>(
    'filemanager_logs',
    loadLogClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
