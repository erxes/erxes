import * as mongoose from 'mongoose';
import { mainDb } from './configs';
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

export interface IModels {
  PeriodLocks: IPeriodLockModel;
  Contracts: IContractModel;
  ContractTypes: IContractTypeModel;
  InsuranceTypes: IInsuranceTypeModel;
  Invoices: IInvoiceModel;
  Schedules: IScheduleModel;
  FirstSchedules: IScheduleModel;
  Transactions: ITransactionModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb);

  return models;
};

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.PeriodLocks = db.model<IPeriodLockDocument, IPeriodLockModel>(
    'loan_period_locks',
    loadPeriodLockClass(models)
  );

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

  return models;
};
