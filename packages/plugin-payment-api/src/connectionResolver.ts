import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';

import { IPaymentConfigDocument } from './models/definitions/payments';
import { IPaymentConfigModel, loadPaymentConfigClass } from './models/Payment';
import { IQpayInvoiceDocument } from './paymentTypes/qPay/models/definitions/qpayInvoices';
import {
  IQpayInvoiceModel,
  loadQpayInvoiceClass
} from './paymentTypes/qPay/models/Qpay';
import { ISocialPayInvoiceDocument } from './paymentTypes/socialPay/models/definitions/socialPayInvoices';
import {
  ISocialPayInvoiceModel,
  loadSocialPayInvoiceClass
} from './paymentTypes/socialPay/models/SocialPay';

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
