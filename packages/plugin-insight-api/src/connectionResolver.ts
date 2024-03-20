import * as mongoose from 'mongoose';
import {
  IChartDocument,
  IDashboardDocument,
  IReportDocument,
  ISectionDocument,
} from './models/definitions/insight';
import { IDashboardModel, loadDashboardClass } from './models/Dashboard';
import { ISectionModel, loadSectionClass } from './models/Section';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IChartModel, loadChartClass } from './models/Chart';
import { IReportModel, loadReportClass } from './models/Report';

export interface IModels {
  Dashboards: IDashboardModel;
  Reports: IReportModel;
  Sections: ISectionModel;
  Charts: IChartModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  serverTiming: any;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Dashboards = db.model<IDashboardDocument, IDashboardModel>(
    'dashboards',
    loadDashboardClass(models, subdomain),
  );

  models.Charts = db.model<IChartDocument, IChartModel>(
    'insight_chart',
    loadChartClass(models),
  );

  models.Reports = db.model<IReportDocument, IReportModel>(
    'report',
    loadReportClass(models),
  );

  models.Sections = db.model<ISectionDocument, ISectionModel>(
    'sections',
    loadSectionClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
