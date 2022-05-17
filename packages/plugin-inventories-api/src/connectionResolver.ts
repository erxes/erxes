import * as mongoose from 'mongoose';
import { IRemainderDocument } from './models/definitions/remainders';
import { IRemainderModel, loadRemainderClass } from './models/Remainders';
import { ITransactionDocument } from './models/definitions/transactions';
import { ITransactionModel, loadTransactionClass } from './models/Transactions';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Transactions: ITransactionModel;
  Remainders: IRemainderModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Transactions = db.model<ITransactionDocument, ITransactionModel>(
    'transactions',
    loadTransactionClass(models)
  );
  models.Remainders = db.model<IRemainderDocument, IRemainderModel>(
    'remainders',
    loadRemainderClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
