import * as mongoose from 'mongoose';
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
import { createGenerateModels } from '@erxes/api-utils/src/core';

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

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

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

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
