import { Model, model } from 'mongoose';

import {
  dashboardItemSchema,
  dashboardSchema,
  IDashboard,
  IDashboardDocument,
  IDashboardItemDocument,
  IDashboardItemEdit,
  IDashboardItemInput
} from './definitions/dashboard';

export interface IDashboardModel extends Model<IDashboardDocument> {
  addDashboard(doc: IDashboard): Promise<IDashboardDocument>;
  editDashboard(_id: string, fields: IDashboard): Promise<IDashboardDocument>;
  removeDashboard(_id: string): void;
}
export interface IDashboardItemModel extends Model<IDashboardItemDocument> {
  addDashboardItem(doc: IDashboardItemInput): Promise<IDashboardItemDocument>;
  editDashboardItem(
    _id: string,
    fields: IDashboardItemEdit
  ): Promise<IDashboardItemDocument>;
  removeDashboardItem(_id: string): void;
}

export const loadDashBoardClass = () => {
  class Dashboard {
    public static addDashboard(doc: IDashboard) {
      return Dashboards.create(doc);
    }

    public static async editDashboard(_id: string, feilds: IDashboard) {
      await Dashboards.updateOne({ _id }, { $set: feilds });

      return Dashboards.findOne({ _id });
    }

    public static async removeDashboard(_id: string) {
      return Dashboards.deleteOne({ _id });
    }
  }

  dashboardSchema.loadClass(Dashboard);

  return dashboardSchema;
};

export const loadDashboardItemClass = () => {
  class DashboardItem {
    public static addDashboardItem(doc: IDashboardItemEdit) {
      return DashboardItems.create(doc);
    }

    public static async editDashboardItem(_id: string, feilds: IDashboard) {
      await DashboardItems.updateOne({ _id }, { $set: feilds });

      return DashboardItems.findOne({ _id });
    }

    public static async removeDashboardItem(_id: string) {
      await DashboardItems.deleteOne({ _id });
    }
  }

  dashboardItemSchema.loadClass(DashboardItem);

  return dashboardItemSchema;
};

loadDashBoardClass();
loadDashboardItemClass();

// tslint:disable-next-line
const Dashboards = model<IDashboardDocument, IDashboardModel>(
  'dashboards',
  dashboardSchema
);
// tslint:disable-next-line
const DashboardItems = model<IDashboardItemDocument, IDashboardItemModel>(
  'dashboard_items',
  dashboardItemSchema
);

export { DashboardItems, Dashboards };
