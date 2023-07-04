import { paginate } from '@erxes/api-utils/src';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { IContext, IModels } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';

const generateFilter = async (
  params,
  models: IModels,
  user: IUserDocument,
  subdomain: string
) => {
  const filter: any = {
    $or: [{ activeStatus: { $exists: false } }, { activeStatus: 'active' }]
  };

  if (params.status) {
    filter.status = params.status;
  }

  if (params.requesterId) {
    filter.requesterId = params.requesterId;
  }

  if (params.userId) {
    filter.userIds = { $in: params.userId };
  }

  if (params.createdAtFrom) {
    filter.createdAt = { $gte: params.createdAtFrom };
  }
  if (params.createdAtTo) {
    filter.createdAt = { ...filter.createdAt, $lte: params.createdAtTo };
  }
  if (params.closedAtFrom) {
    filter.closedAt = { $gte: params.closedAtFrom };
  }
  if (params.closedAtTo) {
    filter.closedAt = { ...filter.closedAt, $lte: params.closedAtTo };
  }
  if (params?.archived) {
    delete filter.$or;
    filter.activeStatus = params?.archived ? 'archived' : 'active';
  }

  if (params?.onlyWaitingMe) {
    const requestIds = await models.Requests.find({
      status: 'waiting',
      userIds: { $in: [user._id] }
    }).distinct('_id');

    const responseIds = await models.Responses.find({
      requestId: { $in: requestIds },
      userId: user._id
    }).distinct('requestId');

    const waitinRequestIds = requestIds.filter(
      requestId => !responseIds.includes(requestId)
    );

    filter._id = { $in: waitinRequestIds };
  }

  if (params?.contentFilter) {
    const { contentType, filters } = params?.contentFilter;
    const request = await models.Requests.findOne({
      contentType,
      activeStatus: 'active'
    });
    if (request) {
      const contentTypeIds = await models.Requests.find({
        contentType,
        $or: [{ activeStatus: { $exists: false } }, { activeStatus: 'active' }]
      }).distinct('contentTypeId');
      const query = { _id: { $in: contentTypeIds } };

      const action =
        request.scope === 'cards'
          ? `${contentType}s.find`
          : `${contentType}.find`;

      for (const { regex, name, value } of filters) {
        if (regex) {
          query[name] = { $regex: value, $options: 'i' };
        } else {
          query[name] = value;
        }
      }

      const contents = await sendCommonMessage({
        subdomain,
        serviceName: request.scope,
        action,
        data: query,
        isRPC: true,
        defaultValue: []
      });

      filter.contentTypeId = { $in: contents.map(content => content?._id) };
    }
  }

  return filter;
};

const generateSort = (sortField, sortDirection) => {
  let sort: any = { createdAt: -1 };

  if (sortField && sortDirection) {
    sort = {};
    sort = { [sortField]: sortDirection };
  }
  return sort;
};

const GrantRequestQueries = {
  async grantRequest(_root, args, { models }: IContext) {
    try {
      return await models.Requests.getGrantRequest(args);
    } catch (e) {
      return null;
    }
  },
  async grantRequests(_root, args, { models, user, subdomain }: IContext) {
    const { sortField, sortDirection } = args;

    const filter = await generateFilter(args, models, user, subdomain);

    const sort = generateSort(sortField, sortDirection);

    return await paginate(models.Requests.find(filter).sort(sort), args);
  },

  async grantRequestsTotalCount(
    _root,
    args,
    { models, user, subdomain }: IContext
  ) {
    const filter = await generateFilter(args, models, user, subdomain);

    return await models.Requests.countDocuments(filter);
  },

  async grantRequestDetail(_root, { _id }, { models }: IContext) {
    return await models.Requests.grantRequestDetail(_id);
  },

  async getGrantRequestActions(_root, args, { models }: IContext) {
    return await models.Requests.getGrantActions();
  }
};

export default GrantRequestQueries;
