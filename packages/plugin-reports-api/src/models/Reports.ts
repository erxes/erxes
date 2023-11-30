import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  IChart,
  IChartDocument,
  IReport,
  IReportDocument,
  reportSchema
} from './definitions/reports';

export interface IReportModel extends Model<IReportDocument> {
  getReport(_id: string): Promise<IReportDocument>;
  createReport(doc: IReport): Promise<IReportDocument>;
  updateReport(_id: string, doc: IReport): Promise<IReportDocument>;
  removeReport(_id: string): void;
}

export const loadReportClass = (models: IModels) => {
  class Report {
    // get
    public static async getReport(_id: string) {
      const report = await models.Reports.findOne({ _id });
      if (!report) {
        throw new Error('Report not found');
      }

      return report;
    }

    // create
    public static async createReport(doc: IReport) {
      return models.Reports.create(doc);
    }
    // update
    public static async updateReport(_id: string, doc: IReport) {
      return models.Reports.updateOne({ _id }, { $set: { ...doc } });
    }
    // remove
    public static async removeReport(_id: string) {
      const report = await models.Reports.getReport(_id);
      if (!report) {
        throw new Error('Report not found');
      }
      return models.Reports.deleteOne({ _id });
    }
  }

  reportSchema.loadClass(Report);

  return reportSchema;
};

export interface IChartModel extends Model<IChartDocument> {
  getChart(_id: string): Promise<IChartDocument>;
  createChart(doc: IChart): Promise<IChartDocument>;
  updateChart(_id: string, doc: IChart): Promise<IChartDocument>;
  removeChart(_id: string): void;
}

export const loadChartClass = (models: IModels) => {
  class Report {
    // get
    public static async getChart(_id: string) {
      const chart = await models.Charts.findOne({ _id });
      if (!chart) {
        throw new Error('chart not found');
      }
      return chart;
    }

    // create
    public static async createChart(doc: IChart) {
      return models.Charts.create(doc);
    }
    // update
    public static async updateChart(_id: string, doc: IChart) {
      return models.Charts.updateOne({ _id }, { $set: { ...doc } });
    }
    // remove
    public static async removeChart(_id: string) {
      const chart = await models.Charts.getChart(_id);
      if (!chart) {
        throw new Error('Report not found');
      }
      return models.Reports.deleteOne({ _id });
    }
  }

  reportSchema.loadClass(Report);

  return reportSchema;
};
