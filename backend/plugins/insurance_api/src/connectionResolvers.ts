import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import { IInsuranceDocument } from '@/insurance/@types/insurance';

import mongoose from 'mongoose';

import { loadInsuranceClass, IInsuranceModel } from '@/insurance/db/models/insurance';

export interface IModels {
  Insurance: IInsuranceModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Insurance = db.model<IInsuranceDocument, IInsuranceModel>(
    'insurance',
    loadInsuranceClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
