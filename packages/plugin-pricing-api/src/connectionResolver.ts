import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IDiscountModel, loadDiscountClass } from './models/Discount';
import { IDiscountDocument } from './models/definitions/discount';

export interface IModels {
  Discounts: IDiscountModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Discounts = db.model<IDiscountDocument, IDiscountModel>(
    'pricing',
    loadDiscountClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
