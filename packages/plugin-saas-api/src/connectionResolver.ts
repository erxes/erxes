import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IPackageDocument } from './models/definitions/packages';
import { IPackageModel, loadPackageClass } from './models/Packages';

export interface IModels {
  Packages: IPackageModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Packages = db.model<IPackageDocument, IPackageModel>(
    'package',
    loadPackageClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses,
);
