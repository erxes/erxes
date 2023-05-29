import { paginate } from '@erxes/api-utils/src';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { serviceDiscovery } from '../../configs';
import { IContext } from '../../connectionResolver';
import { sendCoreMessage, sendTagsMessage } from '../../messageBroker';

interface IListArgs {
  status: string;
  searchValue: string;
  ids?: string;
  page?: number;
  perPage?: number;
  sortField: string;
  sortDirection: number;
  tag: string;
  departmentId: string;
}

const generateFilter = async (
  params: IListArgs,
  user: IUserDocument,
  subdomain: string
) => {
  const { searchValue, tag, departmentId } = params;

  let filter: any = {};

  if (!user.isOwner) {
    const departments = await sendCoreMessage({
      subdomain,
      action: 'departments.find',
      data: {
        userIds: { $in: [user._id] }
      },
      isRPC: true,
      defaultValue: []
    });

    const departmentIds = departments.map(d => d._id);

    filter = {
      $or: [
        { visibility: { $exists: null } },
        { visibility: 'public' },
        {
          $and: [
            { visibility: 'private' },
            {
              $or: [
                { selectedMemberIds: user._id },
                { createdBy: user._id },
                { departmentIds: { $in: departmentIds } }
              ]
            }
          ]
        }
      ]
    };
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }
  if (tag) {
    filter.tagIds = { $in: [tag] };
  }
  if (departmentId) {
    filter.departmentIds = { $in: [departmentId] };
  }

  return filter;
};

const dashBoardQueries = {
  async dashboards(
    _root,
    params: IListArgs,
    { models, user, subdomain }: IContext
  ) {
    const filter = await generateFilter(params, user, subdomain);

    return models.Dashboards.find(filter);
  },

  async dashboardsMain(
    _root,
    params: IListArgs,
    { models, user, subdomain }: IContext
  ) {
    const { page, perPage } = params;

    const filter = await generateFilter(params, user, subdomain);

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

    return [
      'Customers',
      'Deals',
      'Conversations',
      'Tasks',
      'Tickets',
      'Purchases'
    ];
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
