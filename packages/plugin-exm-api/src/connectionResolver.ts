import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';

import { IExmDocument, IExmModel, loadExmClass } from './models/Exms';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Exms: IExmModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.Exms = db.model<IExmDocument, IExmModel>(
    'exms',
    loadExmClass(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
