import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../../connectionResolver';
import { IReport, IReportDocument, reportSchema } from './definitions/insight';

export interface IReportModel extends Model<IReportDocument> {
  generateFilter(params, user): Record<string, any>;
  getReport(_id: string): Promise<IReportDocument>;
  getReports(
    params: IListParams,
    user: IUserDocument,
  ): Promise<IReportDocument[]>;
  getReportsCount(
    params: IListParams,
    user: IUserDocument,
  ): Promise<number>;
  createReport(doc: IReport): Promise<IReportDocument>;
  updateReport(_id: string, doc: IReport): Promise<IReportDocument>;
  removeReport(_id: string): void;
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

export const loadReportClass = (models: IModels) => {
  class Report {
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
    // get
    public static async getReport(_id: string) {
      const report = await models.Reports.findOne({ _id });
      if (!report) {
        throw new Error('Report not found');
      }

      return report;
    }

    public static async getReports(params: IListParams, user: IUserDocument) {
      const filter = models.Reports.generateFilter(params, user);

      const reports = await models.Reports.find(filter).sort({
        createdAt: -1,
      });

      return reports;
    }

    public static async getReportsCount(
      params: IListParams,
      user: IUserDocument,
    ) {
      const filter = models.Reports.generateFilter(params, user);

      const report = await models.Reports.countDocuments(filter);

      return report;
    }

    // create
    public static async createReport(doc: IReport) {
      return models.Reports.create(doc);
    }
    // update
    public static async updateReport(_id: string, doc: IReport) {
      const report = await models.Reports.findOne({ _id });
      if (!report) {
        throw new Error('Report not found');
      }

      await models.Reports.updateOne({ _id }, { $set: { ...doc } });

      return models.Reports.findOne({ _id });
    }
    // remove
    public static async removeReport(_id: string) {
      const report = await models.Reports.findOneAndDelete({
        _id,
      });

      if (!report) {
        throw new Error('Report not found');
      }

      return report;
    }
  }

  reportSchema.loadClass(Report);

  return reportSchema;
};
