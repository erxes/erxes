import { IContext } from "../../connectionResolver";
import { IReportDocument } from "../../db/models/definitions/insight";

export default {
  async charts(report: IReportDocument, {}, { models }: IContext) {
    try {
      const { _id } = report;
      return models.Charts.find({ contentId: _id });
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  async chartsCount(report: IReportDocument, {}, { models }: IContext) {
    try {
      const { _id } = report;
      return models.Charts.find({ contentId: _id }).countDocuments();
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  async createdBy(report: IReportDocument, _params, { models }: IContext) {
    return models.Users.findOne({ _id: report.createdBy });
  },

  async updatedBy(report: IReportDocument, _params, { models }: IContext) {
    return models.Users.findOne({ _id: report.updatedBy });
  },

  async members(report: IReportDocument, _, { dataLoaders }: IContext) {
    const users = await dataLoaders.user.loadMany(report.assignedUserIds || []);

    return users.filter(user => user);
  },

  async tags(report: IReportDocument, _, { models, dataLoaders }: IContext) {
    const tags = await dataLoaders.tag.loadMany(report.tagIds || []);

    return tags.filter(tag => tag);
  },

  async isPinned(report: IReportDocument, { }, { models, user }: IContext) {

    const { userIds } = report

    if ((userIds || []).includes(user._id)) {
      return true
    }

    return false

  },
};
