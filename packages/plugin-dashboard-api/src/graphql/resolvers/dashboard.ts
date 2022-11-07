import { IContext } from '../../connectionResolver';
import { sendTagsMessage } from '../../messageBroker';
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

  async getTags(dashboard: IDashboardDocument, _, { subdomain }: IContext) {
    return sendTagsMessage({
      subdomain,
      action: 'find',
      data: {
        _id: { $in: dashboard.tagIds }
      },
      isRPC: true
    });
  },

  members(dashboard: IDashboardDocument) {
    return (dashboard.selectedMemberIds || []).map(_id => ({
      __typename: 'User',
      _id
    }));
  },

  itemsCount(dashboard: IDashboardDocument, _args, { models }: IContext) {
    return models.DashboardItems.find({ dashboardId: dashboard._id }).count();
  }
};
