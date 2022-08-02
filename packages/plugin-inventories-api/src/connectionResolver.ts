import * as mongoose from 'mongoose';
/* Definitions */
import { IRemainderDocument } from './models/definitions/remainders';
import { ITransactionDocument } from './models/definitions/transactions';
import { ITransactionItemDocument } from './models/definitions/transactionItems';
import { ISafeRemainderDocument } from './models/definitions/safeRemainders';
import { ISafeRemainderItemDocument } from './models/definitions/safeRemainderItems';
/** Models and classes loaders */
import { IRemainderModel, loadRemainderClass } from './models/Remainders';
import { ITransactionModel, loadTransactionClass } from './models/Transactions';
import {
  ITransactionItemModel,
  loadTransactionItemClass
} from './models/TransactionItems';
import {
  ISafeRemainderModel,
  loadSafeRemainderClass
} from './models/SafeRemainders';
import {
  ISafeRemainderItemModel,
  loadSafeRemainderItemClass
} from './models/SafeRemainderItems';

import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Transactions: ITransactionModel;
  TransactionItems: ITransactionItemModel;
  Remainders: IRemainderModel;
  SafeRemainders: ISafeRemainderModel;
  SafeRemainderItems: ISafeRemainderItemModel;
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
  models.TransactionItems = db.model<
    ITransactionItemDocument,
    ITransactionItemModel
  >('transaction_items', loadTransactionItemClass(models));
  models.Remainders = db.model<IRemainderDocument, IRemainderModel>(
    'remainders',
    loadRemainderClass(models)
  );
  models.SafeRemainders = db.model<ISafeRemainderDocument, ISafeRemainderModel>(
    'safe_remainders',
    loadSafeRemainderClass(models)
  );
  models.SafeRemainderItems = db.model<
    ISafeRemainderItemDocument,
    ISafeRemainderItemModel
  >('safe_remainder_items', loadSafeRemainderItemClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
