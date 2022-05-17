import * as mongoose from 'mongoose';
import {
  IDashboardDocument,
  IDashboardItemDocument
} from './models/definitions/dashboard';
import {
  IDashboardModel,
  IDashboardItemModel,
  loadDashboardClass,
  loadDashboardItemClass
} from './models/Dashboard';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Dashboards: IDashboardModel;
  DashboardItems: IDashboardItemModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null; 

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Dashboards = db.model<IDashboardDocument, IDashboardModel>(
    'dashboards',
    loadDashboardClass(models)
  );

  models.DashboardItems = db.model<IDashboardItemDocument, IDashboardItemModel>(
    'dashboard_items',
    loadDashboardItemClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(models, loadClasses);