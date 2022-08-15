import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  ISocialPayInvoiceDocument //  ISocialPayInvoiceDocument,
} from './models/definitions/socialPay'; // IQpayInvoiceDocument ISocialPayInvoiceDocument
import {
  loadSocialPayInvoiceClass, // loadSocialPayInvoiceClass
  ISocialPayInvoiceModel // ISocialPayInvoiceModel
} from './models/socialPay';
import { MongoClient } from 'mongodb';

export interface IModels {
  SocialPayInvoice: ISocialPayInvoiceModel;
}

export interface ICoreModels {
  Users: any;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;
export let coreModels: ICoreModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  coreModels = await connectCore();

  loadClasses(mainDb);

  return models;
};

const connectCore = async () => {
  if (coreModels) {
    return coreModels;
  }

  const url = process.env.API_MONGO_URL || 'mongodb://localhost/erxes';
  const client = new MongoClient(url);

  const dbName = 'erxes';

  let db;

  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  coreModels = {
    Users: db.collection('users')
  };

  return coreModels;
};

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.SocialPayInvoice = db.model<
    ISocialPayInvoiceDocument,
    ISocialPayInvoiceModel
  >('socialpay_invoices', loadSocialPayInvoiceClass(models));

  return models;
};
