import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { ILabelDocument } from './models/definitions/labels';
import { ITimeframeDocument } from './models/definitions/timeframes';
import {
  ISalesLogDocument,
  IDayPlanConfigDocument,
  IMonthPlanConfigDocument,
  IYearPlanConfigDocument
} from './models/definitions/salesplans';
import { ILabelModel, loadLabelClass } from './models/labels';
import { ITimeframeModel, loadTimeframeClass } from './models/timeframes';
import {
  ISalesLogModel,
  loadSalesLogClass,
  IDayPlanConfigModel,
  loadDayPlanConfigClass,
  IMonthPlanConfigModel,
  loadMonthPlanConfigClass,
  IYearPlanConfigModel,
  loadYearPlanConfigClass
} from './models/salesplans';
import { MongoClient } from 'mongodb';

export interface IModels {
  SalesLogs: ISalesLogModel;
  Labels: ILabelModel;
  Timeframes: ITimeframeModel;
  DayPlanConfigs: IDayPlanConfigModel;
  MonthPlanConfigs: IMonthPlanConfigModel;
  YearPlanConfigs: IYearPlanConfigModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export interface ICoreModels {
  Users: any;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;
export let coreModels: ICoreModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  coreModels = await connectCore();

  loadClasses(mainDb);

  return models;
};

const connectCore = async () => {
  if (coreModels) {
    return coreModels;
  }

  const url = process.env.API_MONGO_URL || 'mongodb://localhost/erxes';
  const client = new MongoClient(url);

  const dbName = 'erxes';

  let db;

  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  coreModels = {
    Users: db.collection('users')
  };

  return coreModels;
};

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.SalesLogs = db.model<ISalesLogDocument, ISalesLogModel>(
    'salesLogs',
    loadSalesLogClass(models)
  );

  models.Labels = db.model<ILabelDocument, ILabelModel>(
    'labels',
    loadLabelClass(models)
  );

  models.Timeframes = db.model<ITimeframeDocument, ITimeframeModel>(
    'timeframes',
    loadTimeframeClass(models)
  );

  models.DayPlanConfigs = db.model<IDayPlanConfigDocument, IDayPlanConfigModel>(
    'dayPlanConfigs',
    loadDayPlanConfigClass(models)
  );

  models.MonthPlanConfigs = db.model<
    IMonthPlanConfigDocument,
    IMonthPlanConfigModel
  >('monthPlanConfigs', loadMonthPlanConfigClass(models));

  models.YearPlanConfigs = db.model<
    IYearPlanConfigDocument,
    IYearPlanConfigModel
  >('yearPlanConfigs', loadYearPlanConfigClass(models));

  return models;
};
