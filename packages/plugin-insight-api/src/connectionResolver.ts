import * as mongoose from 'mongoose';
import {
  IChartDocument,
  IDashboardDocument,
  ISectionDocument,
} from './models/definitions/insight';
import { IDashboardModel, loadDashboardClass } from './models/Dashboard';
import { ISectionModel, loadSectionClass } from './models/Section';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IChartModel, loadChartClass } from './models/Chart';

export interface IModels {
  Dashboards: IDashboardModel;
  Sections: ISectionModel;
  Charts: IChartModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  serverTiming: any;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  models = {} as IModels;

  models.Dashboards = db.model<IDashboardDocument, IDashboardModel>(
    'dashboards',
    loadDashboardClass(models, subdomain),
  );

  models.Sections = db.model<ISectionDocument, ISectionModel>(
    'sections',
    loadSectionClass(models, subdomain),
  );

  models.Charts = db.model<IChartDocument, IChartModel>(
    'dashboard_chart',
    loadChartClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses,
);
