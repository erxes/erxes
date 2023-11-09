import { IDynamicModel, loadDynamicClass } from './models/Dynamic';
import * as mongoose from 'mongoose';
import { IDynamicDocument } from './models/definitions/dynamic';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Msdynamics: IDynamicModel;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Msdynamics = db.model<IDynamicDocument, IDynamicModel>(
    'msdynamics',
    loadDynamicClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
