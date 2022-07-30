import { IContext } from '../../connectionResolver';
import { IDashboardDocument } from '../../models/definitions/dashboard';

export default {
  createdUser(dashboard: IDashboardDocument) {
    return (
      dashboard.createdBy && {
        __typename: 'User',
        _id: dashboard.createdBy
      }
    );
  },

  updatedUser(dashboard: IDashboardDocument) {
    return (
      dashboard.updatedBy && {
        __typename: 'User',
        _id: dashboard.updatedBy
      }
    );
  },

  itemsCount(dashboard: IDashboardDocument, _args, { models }: IContext) {
    console.log('aa');
    return models.DashboardItems.find({ dashboardId: dashboard._id }).count();
  }
};
