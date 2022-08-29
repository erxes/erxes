import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IQpayInvoiceDocument, // IQpayInvoiceDocument
  ISocialPayInvoiceDocument //  ISocialPayInvoiceDocument,
} from './models/definitions/qpay'; //IQpayInvoiceDocument ISocialPayInvoiceDocument
import {
  loadQpayInvoiceClass, //loadQpayInvoiceClass
  loadSocialPayInvoiceClass, //loadSocialPayInvoiceClass
  IQpayInvoiceModel, //IQpayInvoiceModel
  ISocialPayInvoiceModel //ISocialPayInvoiceModel
} from './models/Qpay';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  SocialPayInvoice: ISocialPayInvoiceModel;
  QpayInvoice: IQpayInvoiceModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.SocialPayInvoice = db.model<
    ISocialPayInvoiceDocument,
    ISocialPayInvoiceModel
  >('socialpay_invoices', loadSocialPayInvoiceClass(models));

  models.QpayInvoice = db.model<IQpayInvoiceDocument, IQpayInvoiceModel>(
    'qpay_invoices',
    loadQpayInvoiceClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
