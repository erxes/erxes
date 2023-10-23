import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IPeriodLockDocument } from './models/definitions/periodLocks';
import { IContractDocument } from './models/definitions/contracts';
import { IContractTypeDocument } from './models/definitions/contractTypes';
import { ITransactionDocument } from './models/definitions/transactions';
import { loadPeriodLockClass, IPeriodLockModel } from './models/periodLock';
import { loadContractClass, IContractModel } from './models/contracts';
import {
  loadContractTypeClass,
  IContractTypeModel
} from './models/contractTypes';
import { loadTransactionClass, ITransactionModel } from './models/transactions';
import { createGenerateModels } from '@erxes/api-utils/src/core';

import {
  IStoredInterestModel,
  savingStoredInterestClass
} from './models/storedInterest';
import { IStoredInterestDocument } from './models/definitions/storedInterest';

export interface IModels {
  PeriodLocks: IPeriodLockModel;
  Contracts: IContractModel;
  ContractTypes: IContractTypeModel;
  Transactions: ITransactionModel;
  StoredInterest: IStoredInterestModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.PeriodLocks = db.model<IPeriodLockDocument, IPeriodLockModel>(
    'saving_period_locks',
    loadPeriodLockClass(models)
  );

  models.Contracts = db.model<IContractDocument, IContractModel>(
    'saving_contracts',
    loadContractClass(models)
  );

  models.ContractTypes = db.model<IContractTypeDocument, IContractTypeModel>(
    'saving_contract_types',
    loadContractTypeClass(models)
  );

  models.Transactions = db.model<ITransactionDocument, ITransactionModel>(
    'saving_transactions',
    loadTransactionClass(models)
  ) as ITransactionModel;

  models.StoredInterest = db.model<
    IStoredInterestDocument,
    IStoredInterestModel
  >(
    'saving_stored_interest',
    savingStoredInterestClass(models)
  ) as IStoredInterestModel;

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
