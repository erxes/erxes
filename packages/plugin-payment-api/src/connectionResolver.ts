import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IPaymentConfigModel, loadPaymentConfigClass } from './models/Payment';
import { IPaymentConfigDocument } from './models/definitions/payment';
import { IQpayInvoiceDocument } from './models/definitions/qpay';

import { IQpayInvoiceModel, loadQpayInvoiceClass } from './models/Qpay';
import {
  ISocialPayInvoiceModel,
  loadSocialPayInvoiceClass
} from './models/socialPay';
import { ISocialPayInvoiceDocument } from './models/definitions/socialPay';

export interface IModels {
  PaymentConfigs: IPaymentConfigModel;
  QpayInvoice: IQpayInvoiceModel;
  SocialPayInvoice: ISocialPayInvoiceModel;
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

  models.QpayInvoice = db.model<IQpayInvoiceDocument, IQpayInvoiceModel>(
    'qpay_invoice',
    loadQpayInvoiceClass(models)
  );

  models.SocialPayInvoice = db.model<
    ISocialPayInvoiceDocument,
    ISocialPayInvoiceModel
  >('socialpay_invoices', loadSocialPayInvoiceClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
