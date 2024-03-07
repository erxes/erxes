import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendCardsMessage, sendSegmentsMessage } from '../messageBroker';
import {
  dashboardSchema,
  IDashboard,
  IDashboardDocument,
} from './definitions/insight';
import { CONTRIBUTIONTYPE, TEAMGOALTYPE } from '../constants';

export interface IDashboardModel extends Model<IDashboardDocument> {
  getDashboard(_id: string): Promise<IDashboardDocument>;
  createDashboard(doc: IDashboard): Promise<IDashboardDocument>;
  updateDashboard(_id: string, doc: IDashboard): Promise<IDashboardDocument>;
  removeDashboard(_id: string): Promise<IDashboardDocument>;
}

export const loadDashboardClass = (models: IModels, subdomain: string) => {
  class Dashboard {
    public static async getDashboard(_id: string) {
      const dashboard = await models.Dashboards.findOne({
        _id,
      });

      if (!dashboard) {
        throw new Error('Dashboard not found');
      }
      return dashboard;
    }

    public static async createDashboard(doc: IDashboard) {
      return models.Dashboards.create(doc);
    }

    public static async updateDashboard(_id: string, doc: IDashboard) {
      const dashboard = await models.Dashboards.findOne({ _id });
      if (!dashboard) {
        throw new Error('Dashboard not found');
      }

      await models.Dashboards.updateOne({ _id }, { $set: { ...doc } });

      return models.Dashboards.findOne({ _id });
    }

    public static async removeDashboard(_id: string) {
      const dashboard = await models.Dashboards.findOne({
        _id,
      });

      if (!dashboard) {
        throw new Error('Dashboard not found');
      }

      return models.Dashboards.deleteOne({ _id });
    }
  }

  dashboardSchema.loadClass(Dashboard);

  return dashboardSchema;
};
