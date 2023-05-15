import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const generateFilter = params => {
  const filter: any = {};

  if (params.status) {
    filter.status = params.status;
  }

  if (params.requesterId) {
    filter.requesterId = params.requesterId;
  }

  if (params.userId) {
    filter.userId = params.userId;
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
  async grantRequests(_root, args, { models }: IContext) {
    const { sortField, sortDirection } = args;

    const filter = generateFilter(args);

    const sort = generateSort(sortField, sortDirection);

    return await paginate(models.Requests.find(filter).sort(sort), args);
  },

  async grantRequestsTotalCount(_root, args, { models }: IContext) {
    const filter = generateFilter(args);

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
