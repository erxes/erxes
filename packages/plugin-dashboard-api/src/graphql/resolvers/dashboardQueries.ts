import { paginate } from '@erxes/api-utils/src';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { serviceDiscovery } from '../../configs';
import { IContext } from '../../connectionResolver';
import { sendTagsMessage } from '../../messageBroker';

interface IListArgs {
  status: string;
  searchValue: string;
  ids?: string;
  page?: number;
  perPage?: number;
  sortField: string;
  sortDirection: number;
  tag: string;
}

const generateFilter = (params: IListArgs, user: IUserDocument) => {
  const { searchValue, tag } = params;

  const filter: any = user.isOwner
    ? {}
    : {
        $or: [
          { visibility: { $exists: null } },
          { visibility: 'public' },
          {
            $and: [
              { visibility: 'private' },
              {
                $or: [{ selectedMemberIds: user._id }, { createdBy: user._id }]
              }
            ]
          }
        ]
      };

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }
  if (tag) {
    filter.tagIds = { $in: [tag] };
  }

  return filter;
};

const dashBoardQueries = {
  async dashboards(_root, params: IListArgs, { models, user }: IContext) {
    const filter = generateFilter(params, user);

    return models.Dashboards.find(filter);
  },

  async dashboardsMain(_root, params: IListArgs, { models, user }: IContext) {
    const { page, perPage } = params;

    const filter = generateFilter(params, user);

    const dashboards = paginate(
      models.Dashboards.find(filter).sort({ createdAt: -1 }),
      { perPage, page }
    );

    const totalCount = await models.Dashboards.find(filter).countDocuments();

    return {
      list: dashboards,
      totalCount
    };
  },

  dashboardDetails(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Dashboards.findOne({ _id });
  },

  dashboardsTotalCount(_root, args, { models }: IContext) {
    return models.Dashboards.find({}).countDocuments();
  },

  async dashboardGetTypes() {
    const services = await serviceDiscovery.getServices();
    let dashboardTypes: string[] = [];

    for (const serviceName of services) {
      const service = await serviceDiscovery.getService(serviceName, true);
      const meta = service.config?.meta || {};

      if (meta && meta.dashboards) {
        const types = meta.dashboards.types || [];

        dashboardTypes = [...dashboardTypes, ...types];
      }
    }

    const types = ['Customers', 'Deals', 'Conversations', 'Tasks', 'Tickets'];

    if (services.includes('pos')) {
      types.push('Pos');
    }

    return types;
  },

  async dashboardCountByTags(_root, _params, { models, subdomain }: IContext) {
    const counts = {};

    const tags = await sendTagsMessage({
      subdomain,
      action: 'find',
      data: {
        type: 'dashboard:dashboard'
      },
      isRPC: true,
      defaultValue: []
    });

    for (const tag of tags) {
      counts[tag._id] = await models.Dashboards.find({
        tagIds: tag._id,
        status: { $ne: 'deleted' }
      }).countDocuments();
    }

    return counts;
  },

  async dashboardItems(
    _root,
    { dashboardId }: { dashboardId: string },
    { models }: IContext
  ) {
    return models.DashboardItems.find({ dashboardId });
  },

  dashboardItemDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.DashboardItems.findOne({ _id });
  }
};

export default dashBoardQueries;
