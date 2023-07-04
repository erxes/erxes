import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IAccountCategoryModel,
  IAccountModel,
  loadAccountCategoryClass,
  loadAccountClass
} from './models/Accounts';
import {
  IAccountCategoryDocument,
  IAccountDocument
} from './models/definitions/accounts';

import { createGenerateModels } from '@erxes/api-utils/src/core';
export interface IModels {
  Accounts: IAccountModel;
  AccountCategories: IAccountCategoryModel;
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

  models.Accounts = db.model<IAccountDocument, IAccountModel>(
    'accounts',
    loadAccountClass(models, subdomain)
  );

  models.AccountCategories = db.model<
    IAccountCategoryDocument,
    IAccountCategoryModel
  >('account_categories', loadAccountCategoryClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
