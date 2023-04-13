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
  loadLogClass,
  IAckRequestModel,
  IAckRequestDocument,
  loadAckRequestClass,
  IAccessRequestModel,
  IAccessRequestDocument,
  loadAccessRequestClass,
  IRelationModel,
  IRelationDocument,
  loadRelationClass
} from './models';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Folders: IFolderModel;
  Files: IFileModel;
  Logs: ILogModel;
  AckRequests: IAckRequestModel;
  AccessRequests: IAccessRequestModel;
  Relations: IRelationModel;
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

  models.AckRequests = db.model<IAckRequestDocument, IAckRequestModel>(
    'filemanager_ack_requests',
    loadAckRequestClass(models)
  );

  models.AccessRequests = db.model<IAccessRequestDocument, IAccessRequestModel>(
    'filemanager_access_requests',
    loadAccessRequestClass(models)
  );

  models.Relations = db.model<IRelationDocument, IRelationModel>(
    'filemanager_relations',
    loadRelationClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
