import { Model } from 'mongoose';

import { IUserDocument } from '@erxes/api-utils/src/types';
import { IModels } from '../../connectionResolver';
import {
  dashboardSchema,
  IDashboard,
  IDashboardDocument,
} from './definitions/insight';

export interface IDashboardModel extends Model<IDashboardDocument> {
  generateFilter(params, user): Record<string, any>;
  getDashboard(_id: string): Promise<IDashboardDocument>;
  getDashboards(
    params: IListParams,
    user: IUserDocument,
  ): Promise<IDashboardDocument[]>;
  getDashboardsCount(
    params: IListParams,
    user: IUserDocument,
  ): Promise<number>;
  createDashboard(doc: IDashboard): Promise<IDashboardDocument>;
  updateDashboard(_id: string, doc: IDashboard): Promise<IDashboardDocument>;
  removeDashboard(_id: string): Promise<IDashboardDocument>;
}

interface IListParams {
  branch?: string;
  department?: string;
  unit?: string;
  contribution?: string;
  date?: Date;
  endDate?: Date;
  sectionId?: string;
  userIds?: string[];
}

export const loadDashboardClass = (models: IModels, _subdomain: string) => {
  class Dashboard {
    public static generateFilter(
      params: IListParams,
      user: IUserDocument,
    ) {
      const {
        branch,
        department,
        unit,
        contribution,
        date,
        endDate,
        sectionId,
        userIds,
      } = params;

      let filter: any = {};

      if (user && !user.isOwner) {

        filter = {
          $or: [
            { visibility: { $exists: null } },
            { visibility: 'public' },
            {
              $and: [
                { visibility: 'private' },
                {
                  $or: [
                    { createdBy: user._id },
                    { assignedUserIds: { $in: [user._id] } },
                    { assignedDepartmentIds: { $in: user.departmentIds || [] } },
                  ],
                },
              ],
            },
          ],
        };
      }

      if (branch) {
        filter.branch = branch;
      }

      if (department) {
        filter.department = department;
      }

      if (unit) {
        filter.unit = unit;
      }

      if (contribution) {
        filter.contribution = { $in: [contribution] };
      }

      if (date) {
        filter.startDate = { $gt: new Date(date) };
      }

      if (endDate) {
        filter.endDate = { $gt: new Date(endDate) };
      }

      if (sectionId) {
        filter.sectionId = { $eq: sectionId };
      }

      if (userIds) {
        filter.userIds = { $in: userIds };
      }

      return filter;
    }

    public static async getDashboard(_id: string) {
      const dashboard = await models.Dashboards.findOne({
        _id,
      });

      if (!dashboard) {
        throw new Error('Dashboard not found');
      }
      return dashboard;
    }

    public static async getDashboards(
      params: IListParams,
      user: IUserDocument,
    ) {
      const filter = models.Dashboards.generateFilter(params, user);

      const dashboards = await models.Dashboards.find(filter).sort({
        createdAt: -1,
      });

      return dashboards;
    }

    public static async getDashboardsCount(
      params: IListParams,
      user: IUserDocument,
    ) {
      const filter = models.Dashboards.generateFilter(params, user);

      const dashboard = await models.Dashboards.countDocuments(filter);

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
      const dashboard = await models.Dashboards.findOneAndDelete({
        _id,
      });

      if (!dashboard) {
        throw new Error('Dashboard not found');
      }

      return dashboard;
    }
  }

  dashboardSchema.loadClass(Dashboard);

  return dashboardSchema;
};
