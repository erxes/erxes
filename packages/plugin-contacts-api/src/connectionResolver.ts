import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { ICompanyModel, loadCompanyClass } from './models/Companies';
import { ICustomerModel, loadCustomerClass } from './models/Customers';
import { ICustomerDocument } from './models/definitions/customers';
import { ICompanyDocument } from './models/definitions/companies';

export interface ICoreIModels {
  Configs;
  Brands;
  Users;
  Fields;
  FieldsGroups;
  Forms;
  EmailDeliveries;
  FormSubmissions;
}
export interface IModels {
  Companies: ICompanyModel;
  Customers: ICustomerModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  coreModels: ICoreIModels;
}

export let models: IModels;
export let coreModels: ICoreIModels;

export const generateCoreModels = async (
  _hostnameOrSubdomain: string
): Promise<ICoreIModels> => {
  return coreModels;
};

export const generateModels = async (
  hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  coreModels = await connectCore();

  loadClasses(mainDb, hostnameOrSubdomain);

  return models;
};

export const getSubdomain = (hostname: string): string => {
  return hostname.replace(/(^\w+:|^)\/\//, '').split('.')[0];
};

export const connectCore = async () => {
  if(coreModels) { return coreModels; }

  const url = process.env.API_MONGO_URL || 'mongodb://localhost/erxes';
  const client = new MongoClient(url);

  let db;

  await client.connect();

  console.log(`Connected successfully to ${url}`);

  db = client.db();

  coreModels =  {
    Configs: await db.collection('configs'),
    Brands: await db.collection('brands'),
    Users: await db.collection('users'),
    Fields: await db.collection('form_fields'),
    FieldsGroups: await db.collection('form_field_groups'),
    Forms: await db.collection('forms'),
    EmailDeliveries: await db.collection('email_deliveries'),
    FormSubmissions: await db.collection('form_submissions'),
  }

  return coreModels;
}

export const loadClasses = (db: mongoose.Connection, subdomain: string): IModels => {
  models = {} as IModels;
  
  models.Customers = db.model<ICustomerDocument, ICustomerModel>('customers', loadCustomerClass(models, subdomain));  
  
  models.Companies = db.model<ICompanyDocument, ICompanyModel>('companies', loadCompanyClass(models, subdomain));

  return models;
};