import * as mongoose from 'mongoose';
import { IRemainderDocument } from './models/definitions/remainders';
import { IRemainderModel, loadRemainderClass } from './models/Remainders';
import {
  ITransactionDocument,
  ITrItemDocument
} from './models/definitions/transactions';
import {
  ITransactionModel,
  ITrItemModel,
  loadTransactionClass,
  loadTrItemClass
} from './models/Transactions';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import {
  ISafeRemainderModel,
  loadSafeRemainderClass
} from './models/SafeRemainders';

export interface IModels {
  TrItems: ITrItemModel;
  Transactions: ITransactionModel;
  Remainders: IRemainderModel;
  SafeRemainders: ISafeRemainderModel;
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
  models.TrItems = db.model<ITrItemDocument, ITrItemModel>(
    'transactions',
    loadTrItemClass(models)
  );
  models.Remainders = db.model<IRemainderDocument, IRemainderModel>(
    'remainders',
    loadRemainderClass(models)
  );
  models.SafeRemainders = db.model<IRemainderDocument, ISafeRemainderModel>(
    'safe_remainders',
    loadSafeRemainderClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
