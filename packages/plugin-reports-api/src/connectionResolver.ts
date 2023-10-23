import * as mongoose from 'mongoose';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IChartModel,
  IReportModel,
  loadChartClass,
  loadReportClass
} from './models/Reports';
import { IChartDocument, IReportDocument } from './models/definitions/reports';

export interface IModels {
  Reports: IReportModel;
  Charts: IChartModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Reports = db.model<IReportDocument, IReportModel>(
    'report',
    loadReportClass(models)
  );

  models.Charts = db.model<IChartDocument, IChartModel>(
    'chart',
    loadChartClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
