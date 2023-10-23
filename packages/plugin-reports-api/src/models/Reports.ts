import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { IReport, IReportDocument, reportSchema } from './definitions/reports';

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
      return models.Reports.create({
        ...doc
      });
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
