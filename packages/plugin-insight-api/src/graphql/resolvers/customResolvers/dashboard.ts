import { IContext } from '../../../connectionResolver';
import { IDashboardDocument } from '../../../models/definitions/insight';

export default {
  async charts(
    dashboard: IDashboardDocument,
    {},
    { models }: IContext,
    { queryParams },
  ) {
    try {
      const { _id } = dashboard;
      return models.Charts.find({ dashboardId: _id });
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  chartsCount(dashboard: IDashboardDocument, {}, { models }: IContext) {
    try {
      const { _id } = dashboard;
      return models.Charts.find({ dashboardId: _id }).countDocuments();
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  createdBy(dashboard: IDashboardDocument) {
    return (
      dashboard.createdBy && {
        __typename: 'User',
        _id: dashboard.createdBy,
      }
    );
  },
  updatedBy(dashboard: IDashboardDocument) {
    return (
      dashboard.updatedBy && {
        __typename: 'User',
        _id: dashboard.updatedBy,
      }
    );
  },
  members(dashboard: IDashboardDocument) {
    return (dashboard.assignedUserIds || []).map((_id) => ({
      __typename: 'User',
      _id,
    }));
  },
};
