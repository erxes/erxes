import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IPeriodLockDocument } from './models/definitions/periodLocks';
import { IContractDocument } from './models/definitions/contracts';
import { IContractTypeDocument } from './models/definitions/contractTypes';
import { IInsuranceTypeDocument } from './models/definitions/insuranceTypes';
import { IInvoiceDocument } from './models/definitions/invoices';
import { IScheduleDocument } from './models/definitions/schedules';
import { ITransactionDocument } from './models/definitions/transactions';
import { loadPeriodLockClass, IPeriodLockModel } from './models/periodLock';
import { loadContractClass, IContractModel } from './models/contracts';
import {
  loadContractTypeClass,
  IContractTypeModel
} from './models/contractTypes';
import {
  loadInsuranceTypeClass,
  IInsuranceTypeModel
} from './models/insuranceTypes';
import { loadInvoiceClass, IInvoiceModel } from './models/invoices';
import { loadScheduleClass, IScheduleModel } from './models/schedules';
import { loadTransactionClass, ITransactionModel } from './models/transactions';
import { IGeneralModel, loadGeneralClass } from './models/general';
import { IGeneralDocument } from './models/definitions/general';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import {
  IClassificationModel,
  loadClassificationClass
} from './models/classification';
import { IClassificationDocument } from './models/definitions/classification';
import {
  IInterestCorrectionModel,
  loanInterestCorrectionClass
} from './models/interestCorrection';
import { IInterestCorrectionDocument } from './models/definitions/interestCorrection';
import {
  IStoredInterestModel,
  loanStoredInterestClass
} from './models/storedInterest';
import { IStoredInterestDocument } from './models/definitions/storedInterest';

export interface IModels {
  PeriodLocks: IPeriodLockModel;
  Contracts: IContractModel;
  ContractTypes: IContractTypeModel;
  InsuranceTypes: IInsuranceTypeModel;
  Invoices: IInvoiceModel;
  Schedules: IScheduleModel;
  FirstSchedules: IScheduleModel;
  Transactions: ITransactionModel;
  General: IGeneralModel;
  Classification: IClassificationModel;
  InterestCorrection: IInterestCorrectionModel;
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
    'loan_period_locks',
    loadPeriodLockClass(models)
  );

  models.Classification = db.model<
    IClassificationDocument,
    IClassificationModel
  >('loan_classification', loadClassificationClass(models));

  models.Contracts = db.model<IContractDocument, IContractModel>(
    'loan_contracts',
    loadContractClass(models)
  );

  models.ContractTypes = db.model<IContractTypeDocument, IContractTypeModel>(
    'loan_contract_types',
    loadContractTypeClass(models)
  );

  models.InsuranceTypes = db.model<IInsuranceTypeDocument, IInsuranceTypeModel>(
    'loan_insurance_types',
    loadInsuranceTypeClass(models)
  );

  models.Invoices = db.model<IInvoiceDocument, IInvoiceModel>(
    'loan_invoices',
    loadInvoiceClass(models)
  );

  models.Schedules = db.model<IScheduleDocument, IScheduleModel>(
    'loan_schedules',
    loadScheduleClass(models)
  );

  models.FirstSchedules = db.model<IScheduleDocument, IScheduleModel>(
    'loan_first_schedules',
    loadScheduleClass(models)
  );

  models.Transactions = db.model<ITransactionDocument, ITransactionModel>(
    'loan_transactions',
    loadTransactionClass(models)
  ) as ITransactionModel;

  models.General = db.model<IGeneralDocument, IGeneralModel>(
    'loan_general',
    loadGeneralClass(models)
  ) as IGeneralModel;

  models.InterestCorrection = db.model<
    IInterestCorrectionDocument,
    IInterestCorrectionModel
  >(
    'loan_interest_correction',
    loanInterestCorrectionClass(models)
  ) as IInterestCorrectionModel;

  models.StoredInterest = db.model<
    IStoredInterestDocument,
    IStoredInterestModel
  >(
    'loan_stored_interest',
    loanStoredInterestClass(models)
  ) as IStoredInterestModel;

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
