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
} from './models/SocialPay';
import { ISocialPayInvoiceDocument } from './models/definitions/socialPay';

export interface IModels {
  PaymentConfigs: IPaymentConfigModel;
  QpayInvoices: IQpayInvoiceModel;
  SocialPayInvoices: ISocialPayInvoiceModel;
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

  models.QpayInvoices = db.model<IQpayInvoiceDocument, IQpayInvoiceModel>(
    'qpay_invoice',
    loadQpayInvoiceClass(models)
  );

  models.SocialPayInvoices = db.model<
    ISocialPayInvoiceDocument,
    ISocialPayInvoiceModel
  >('socialpay_invoice', loadSocialPayInvoiceClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
