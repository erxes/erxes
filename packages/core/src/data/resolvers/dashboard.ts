import { IContext } from "../../connectionResolver";
import { IDashboardDocument } from "../../db/models/definitions/insight";

export default {
  async charts(dashboard: IDashboardDocument, _params, { models }: IContext) {
    try {
      const { _id } = dashboard;
      return models.Charts.find({ contentId: _id });
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  async chartsCount(
    dashboard: IDashboardDocument,
    _params,
    { models }: IContext
  ) {
    try {
      const { _id } = dashboard;
      return models.Charts.find({ contentId: _id }).countDocuments();
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  async createdBy(
    dashboard: IDashboardDocument,
    _params,
    { models }: IContext
  ) {
    return models.Users.findOne({ _id: dashboard.createdBy });
  },
  async updatedBy(
    dashboard: IDashboardDocument,
    _params,
    { models }: IContext
  ) {
    return models.Users.findOne({ _id: dashboard.updatedBy });
  },
  async members(
    dashboard: IDashboardDocument,
    _params,
    { dataLoaders }: IContext
  ) {
    const members = await dataLoaders.user.loadMany(
      dashboard.assignedUserIds || []
    );

    return members.filter(member => member);
  },
  async isPinned(dashboard: IDashboardDocument, { }, { models, user }: IContext) {

    const { userIds } = dashboard

    if ((userIds || []).includes(user._id)) {
      return true
    }

    return false

  },
};
