import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';

import { IInvoiceDocument } from './models/definitions/invoices';
import { IPaymentConfigDocument } from './models/definitions/paymentConfigs';
import { IPaymentDocument } from './models/definitions/payments';
import { IInvoiceModel, loadInvoiceClass } from './models/Invoices';
import {
  IPaymentConfigModel,
  loadPaymentConfigClass
} from './models/PaymentConfigs';
import { IPaymentModel, loadPaymentClass } from './models/Payments';

export interface IModels {
  Payments: IPaymentModel;
  Invoices: IInvoiceModel;
  PaymentConfigs: IPaymentConfigModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Payments = db.model<IPaymentDocument, IPaymentModel>(
    'payments',
    loadPaymentClass(models)
  );

  models.Invoices = db.model<IInvoiceDocument, IInvoiceModel>(
    'invoices',
    loadInvoiceClass(models)
  );

  models.PaymentConfigs = db.model<IPaymentConfigDocument, IPaymentConfigModel>(
    'payment_configs',
    loadPaymentConfigClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
