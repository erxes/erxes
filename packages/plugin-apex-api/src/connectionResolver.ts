import * as mongoose from 'mongoose';
import {
  IReportModel,
  loadReportClass,
  IReportDocument,
} from './models/Reports';
import { IStoryModel, loadStoryClass, IStoryDocument } from './models/Stories';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Reports: IReportModel;
  Stories: IStoryModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  _subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Reports = db.model<IReportDocument, IReportModel>(
    'apex_reports',
    loadReportClass(models),
  );

  models.Stories = db.model<IStoryDocument, IStoryModel>(
    'apex_stories',
    loadStoryClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
