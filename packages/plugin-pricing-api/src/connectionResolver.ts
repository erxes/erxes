import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IPricingPlanModel, loadPricingPlanClass } from './models/PricingPlan';
import { IPricingPlanDocument } from './models/definitions/pricingPlan';

export interface IModels {
  PricingPlans: IPricingPlanModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.PricingPlans = db.model<IPricingPlanDocument, IPricingPlanModel>(
    'pricing',
    loadPricingPlanClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
