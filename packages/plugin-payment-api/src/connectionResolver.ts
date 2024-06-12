import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';

import { IInvoiceDocument } from './models/definitions/invoices';
import { IPaymentConfigDocument } from './models/definitions/paymentConfigs';
import { IPaymentDocument } from './models/definitions/payments';
import { IInvoiceModel, loadInvoiceClass } from './models/Invoices';
import {
  IPaymentConfigModel,
  loadPaymentConfigClass,
} from './models/PaymentConfigs';
import { IPaymentModel, loadPaymentClass } from './models/Payments';
import { ITransactionModel, loadTransactionClass } from './models/Transactions';
import { ITransactionDocument } from './models/definitions/transactions';

export interface IModels {
  PaymentMethods: IPaymentModel;
  Invoices: IInvoiceModel;
  Transactions: ITransactionModel;
  PaymentConfigs: IPaymentConfigModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.PaymentMethods = db.model<IPaymentDocument, IPaymentModel>(
    'payment_methods',
    loadPaymentClass(models)
  );

  models.Invoices = db.model<IInvoiceDocument, IInvoiceModel>(
    'payment_invoices',
    loadInvoiceClass(models)
  );

  models.PaymentConfigs = db.model<IPaymentConfigDocument, IPaymentConfigModel>(
    'payment_configs',
    loadPaymentConfigClass(models)
  );

  models.Transactions = db.model<ITransactionDocument, ITransactionModel>(
    'payment_transactions',
    loadTransactionClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
