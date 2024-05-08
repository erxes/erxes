import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import {
  IAccountCategoryModel,
  loadAccountCategoryClass,
} from './models/AccountCategories';
import {
  IAccountModel,
  loadAccountClass,
} from './models/Accounts';
import {
  IAccountingsConfigModel,
  loadAccountingsConfigClass,
} from './models/Configs';
import {
  ITransactionModel,
  loadTransactionClass,
} from './models/Transactions';
import {
  IAccountDocument,
} from './models/definitions/account';
import {
  IAccountCategoryDocument,
} from './models/definitions/accountCategory';
import { IAccountingsConfigDocument } from './models/definitions/config';
import {
  ITransactionDocument,
} from './models/definitions/transaction';
import { IVatRowDocument } from './models/definitions/vatRow';
import { ICtaxRowDocument } from './models/definitions/ctaxRow';
import { IVatRowModel, loadVatRowClass } from './models/VatRows';
import { ICtaxRowModel, loadCtaxRowClass } from './models/CtaxRows';

export interface IModels {
  Accounts: IAccountModel;
  Transactions: ITransactionModel;
  AccountCategories: IAccountCategoryModel;
  AccountingsConfigs: IAccountingsConfigModel;
  VatRows: IVatRowModel;
  CtaxRows: ICtaxRowModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Accounts = db.model<IAccountDocument, IAccountModel>(
    'accountings',
    loadAccountClass(models, subdomain),
  );
  models.AccountingsConfigs = db.model<
    IAccountingsConfigDocument,
    IAccountingsConfigModel
  >('accountings_configs', loadAccountingsConfigClass(models));
  models.AccountCategories = db.model<
    IAccountCategoryDocument,
    IAccountCategoryModel
  >('accounting_categories', loadAccountCategoryClass(models));

  models.Transactions = db.model<ITransactionDocument, ITransactionModel>(
    'transactions',
    loadTransactionClass(models, subdomain),
  );

  models.VatRows = db.model<IVatRowDocument, IVatRowModel>(
    'vat_rows',
    loadVatRowClass(models, subdomain),
  );
  models.CtaxRows = db.model<ICtaxRowDocument, ICtaxRowModel>(
    'ctax_rows',
    loadCtaxRowClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
