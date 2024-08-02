import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';

import { IExm, IExmDocument, IExmModel, loadExmClass } from './models/Exms';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Exms: IExmModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Exms = db.model<IExm, IExmModel>(
    'exms',
    loadExmClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
