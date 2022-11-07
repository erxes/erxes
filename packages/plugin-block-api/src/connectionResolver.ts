import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IPackageDocument } from './models/definitions/packages';
import { IInvestmentDocument } from './models/definitions/investments';
import { IPackageModel, loadPackageClass } from './models/Packages';
import { IInvestmentModel, loadInvestmentClass } from './models/Investments';
import { ITransactionDocument } from './models/definitions/transactions';
import { ITransactionModel, loadTransactionClass } from './models/Transactions';
import { IBlockModel, loadBlockClass } from './models/Block';
import { IBlockDocument } from './models/definitions/blocks';

export interface IModels {
  Packages: IPackageModel;
  Investments: IInvestmentModel;
  Transactions: ITransactionModel;
  Blocks: IBlockModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Packages = db.model<IPackageDocument, IPackageModel>(
    'package',
    loadPackageClass(models)
  );

  models.Investments = db.model<IInvestmentDocument, IInvestmentModel>(
    'investments',
    loadInvestmentClass(models)
  );

  models.Transactions = db.model<ITransactionDocument, ITransactionModel>(
    'transactions',
    loadTransactionClass(models)
  );

  models.Blocks = db.model<IBlockDocument, IBlockModel>(
    'blocks',
    loadBlockClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
