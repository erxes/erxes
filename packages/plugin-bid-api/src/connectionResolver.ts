import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import { loadPolarissyncClass } from './models';

export interface IModels {
  Polarissyncs: any;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Polarissyncs = db.model<any, any>(
    'polaris_datas',
    loadPolarissyncClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
