import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import { IPricingDocument } from '@/pricing/@types/pricing';

import mongoose from 'mongoose';

import { loadPricingClass, IPricingModel } from '@/pricing/db/models/pricing';

export interface IModels {
  Pricing: IPricingModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Pricing = db.model<IPricingDocument, IPricingModel>(
    'pricing',
    loadPricingClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
