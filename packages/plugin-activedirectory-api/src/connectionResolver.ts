import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IActiveDocument } from './models/definitions/active';
import { loadActiveDirectoryClass, IActiveModel } from './models/Actives';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  ActiveDirectory: IActiveModel;
  loadActiveDirectoryClass: IActiveModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  const models = {} as IModels;

  models.ActiveDirectory = db.model<IActiveDocument, IActiveModel>(
    'activedirectories',
    loadActiveDirectoryClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
