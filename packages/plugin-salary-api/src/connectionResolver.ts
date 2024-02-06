import * as mongoose from 'mongoose';

import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

import { ISalaryModel, loadSalaryClass } from './models/Salary';
import { ISalaryDocument } from './models/definitions/salary';

export interface IModels {
  Salaries: ISalaryModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;
  models.Salaries = db.model<ISalaryDocument, ISalaryModel>(
    'salaries',
    loadSalaryClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses,
);
