import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IPaymentConfigModel, loadPaymentConfigClass } from './models/Payment';
import { IPaymentConfigDocument } from './models/definitions/payment';

export interface IModels {
  PaymentConfigs: IPaymentConfigModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.PaymentConfigs = db.model<IPaymentConfigDocument, IPaymentConfigModel>(
    'payment_config',
    loadPaymentConfigClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
