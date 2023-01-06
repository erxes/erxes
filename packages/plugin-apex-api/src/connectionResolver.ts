import * as mongoose from 'mongoose';
import {
  IReportModel,
  loadReportClass,
  IReportDocument
} from './models/Reports';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Reports: IReportModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  _subdomain: string
): IModels => {
  models = {} as IModels;

  models.Reports = db.model<IReportDocument, IReportModel>(
    'apex_reports',
    loadReportClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
