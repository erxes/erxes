import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendCardsMessage, sendSegmentsMessage } from '../messageBroker';
import {
  chartSchema,
  dashboardSchema,
  IChart,
  IChartDocument,
  IChartEdit,
  IDashboard,
  IDashboardDocument,
} from './definitions/insight';
import { CONTRIBUTIONTYPE, TEAMGOALTYPE } from '../constants';

export interface IChartModel extends Model<IChartDocument> {
  getChart(_id: string): Promise<IChartDocument>;
  createChart(doc: IChart): Promise<IChartDocument>;
  updateChart(_id: string, doc: IChartEdit): Promise<IChartDocument>;
  removeChart(_id: string): void;
}

export const loadChartClass = (models: IModels) => {
  class Chart {
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
      await models.Charts.updateOne({ _id }, { $set: doc });
      return models.Charts.findOne({ _id });
    }
    // remove
    public static async removeChart(_id: string) {
      const chart = await models.Charts.getChart(_id);
      if (!chart) {
        throw new Error('Chart not found');
      }
      return models.Charts.deleteOne({ _id });
    }
  }

  chartSchema.loadClass(Chart);

  return chartSchema;
};
