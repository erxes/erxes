import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { ICompanyModel, loadCompanyClass } from './models/Companies';
import { ICustomerModel, loadCustomerClass } from './models/Customers';
import { ICustomerDocument } from './models/definitions/customers';
import { ICompanyDocument } from './models/definitions/companies';
export interface IModels {
  Companies: ICompanyModel;
  Customers: ICustomerModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;

export const generateModels = async (
  hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb, hostnameOrSubdomain);

  return models;
};

export const getSubdomain = (hostname: string): string => {
  return hostname.replace(/(^\w+:|^)\/\//, '').split('.')[0];
};

export const loadClasses = (db: mongoose.Connection, subdomain: string): IModels => {
  models = {} as IModels;
  
  models.Customers = db.model<ICustomerDocument, ICustomerModel>('customers', loadCustomerClass(models, subdomain));  
  
  models.Companies = db.model<ICompanyDocument, ICompanyModel>('companies', loadCompanyClass(models, subdomain));

  return models;
};