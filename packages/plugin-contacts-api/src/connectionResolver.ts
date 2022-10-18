import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { ICompanyModel, loadCompanyClass } from './models/Companies';
import { ICustomerModel, loadCustomerClass } from './models/Customers';
import { ICustomerDocument } from './models/definitions/customers';
import { ICompanyDocument } from './models/definitions/companies';
import { createGenerateModels } from '@erxes/api-utils/src/core';
export interface IModels {
  Companies: ICompanyModel;
  Customers: ICustomerModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.Customers = db.model<ICustomerDocument, ICustomerModel>(
    'customers',
    loadCustomerClass(models, subdomain)
  );

  models.Companies = db.model<ICompanyDocument, ICompanyModel>(
    'companies',
    loadCompanyClass(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
