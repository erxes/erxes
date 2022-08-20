import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IAdjustmentDocument } from './models/definitions/adjustments';
import {
  ICollateralDataDoc,
  IContractDocument
} from './models/definitions/contracts';
import { IContractTypeDocument } from './models/definitions/contractTypes';
import { IErkhetResponseDocument } from './models/definitions/erkhetResponses';
import { IInsuranceTypeDocument } from './models/definitions/insuranceTypes';
import { IInvoiceDocument } from './models/definitions/invoices';
import { IScheduleDocument } from './models/definitions/schedules';
import { ITransactionDocument } from './models/definitions/transactions';
// import {
//   loadFeedClass,
//   loadExmThankClass,
//   IThankModel,
//   IFeedModel,
// } from '../../plugin-exmfeed-api/src/models/exmFeed';
import { loadAdjustmentClass, IAdjustmentModel } from './models/adjustments';
import { loadContractClass, IContractModel } from './models/contracts';
import {
  loadContractTypeClass,
  IContractTypeModel
} from './models/contractTypes';
import {
  loadErkhetResponseClass,
  IErkhetResponseModel
} from './models/erkhetResponses';
import {
  loadInsuranceTypeClass,
  IInsuranceTypeModel
} from './models/insuranceTypes';
import { loadInvoiceClass, IInvoiceModel } from './models/invoices';
import { loadScheduleClass, IScheduleModel } from './models/schedules';
import { loadTransactionClass, ITransactionModel } from './models/transactions';

export interface IModels {
  Adjustments: IAdjustmentModel;
  Contracts: IContractModel;
  ContractTypes: IContractTypeModel;
  ErkhetResponses: IErkhetResponseModel;
  InsuranceTypes: IInsuranceTypeModel;
  Invoices: IInvoiceModel;
  Schedules: IScheduleModel;
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

  models.Adjustments = db.model<IAdjustmentDocument, IAdjustmentModel>(
    'adjustments',
    loadAdjustmentClass(models)
  );

  models.Contracts = db.model<IContractDocument, IContractModel>(
    'contracts',
    loadContractClass(models)
  );

  models.ContractTypes = db.model<IContractTypeDocument, IContractTypeModel>(
    'contract_types',
    loadContractTypeClass(models)
  );

  models.ErkhetResponses = db.model<
    IErkhetResponseDocument,
    IErkhetResponseModel
  >('erkhet_responses', loadErkhetResponseClass(models));

  models.InsuranceTypes = db.model<IInsuranceTypeDocument, IInsuranceTypeModel>(
    'insurance_types',
    loadInsuranceTypeClass(models)
  );

  models.Invoices = db.model<IInvoiceDocument, IInvoiceModel>(
    'invoices',
    loadInvoiceClass(models)
  );

  models.Schedules = db.model<IScheduleDocument, IScheduleModel>(
    'schedules',
    loadScheduleClass(models)
  );

  models.Transactions = db.model<ITransactionDocument, ITransactionModel>(
    'transactions',
    loadTransactionClass(models)
  ) as ITransactionModel;

  return models;
};
