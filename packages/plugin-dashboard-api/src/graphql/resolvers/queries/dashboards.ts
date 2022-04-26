import {
  DashboardFilters,
  DashboardFilterTypes
} from '../../../constants';
import { DashboardItems, Dashboards } from '../../../db/models';

import {
  getBoards,
  getBrands,
  getIntegrations,
  getIntegrationTypes,
  getLabels,
  getPipelines,
  getTags,
  getUsers
} from '../../../utils';
import { IContext } from '@erxes/api-utils/src';

const dashBoardQueries = {
  dashboards(_root, _args, { user }: IContext) {
    const dashboardFilter = user.isOwner
      ? {}
      : {
          $or: [
            { visibility: { $exists: null } },
            { visibility: 'public' },
            {
              $and: [
                { visibility: 'private' },
                {
                  $or: [{ selectedMemberIds: user._id }]
                }
              ]
            }
          ]
        };

    return Dashboards.find(dashboardFilter).sort({ order: 1 });
  },

  dashboardDetails(_root, { _id }: { _id: string }) {
    return Dashboards.findOne({ _id });
  },

  dashboardsTotalCount() {
    return Dashboards.find({}).countDocuments();
  },

  async dashboardItems(_root, { dashboardId }: { dashboardId: string }) {
    return DashboardItems.find({ dashboardId });
  },

  dashboardItemDetail(_root, { _id }: { _id: string }) {
    return DashboardItems.findOne({ _id });
  },

  async dashboardInitialDatas(
    _root,
    { type }: { type: string },
    { dataSources }: IContext
  ) {
    return dataSources.HelpersApi.fetchApi('/get-dashboards', { type });
  },

  async dashboardFilters(_root, { type }: { type: string }) {
    const filters = DashboardFilters[type];

    const shemaType = type.split('.')[0];
    let tagType = 'customer';
    let stageType = 'deal';

    switch (shemaType) {
      case 'Conversations':
        tagType = 'conversation';
        break;

      case 'ConversationProperties':
        tagType = 'conversation';
        break;

      case 'Companies':
        tagType = 'company';
        break;

      case 'Tasks':
        stageType = 'task';
        break;

      case 'Tickets':
        stageType = 'ticket';
        break;
    }

    if (!filters) {
      if (type.includes('pipeline')) {
        return getPipelines(stageType);
      }

      if (DashboardFilterTypes.User.some(name => type.includes(name))) {
        return getUsers();
      }

      if (type.includes('brand')) {
        return getBrands();
      }

      if (type.includes('integrationName')) {
        return getIntegrations();
      }

      if (type.includes('integrationType')) {
        return getIntegrationTypes();
      }

      if (type.includes('board')) {
        return getBoards(stageType);
      }

      if (type.includes('tag')) {
        return getTags(tagType);
      }

      if (type.includes('label')) {
        return getLabels();
      }
    }

    return filters;
  }
};

export default dashBoardQueries;
