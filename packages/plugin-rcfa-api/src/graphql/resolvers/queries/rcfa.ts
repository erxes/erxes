import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const generateFilters = async (params: any) => {
  const filter: any = {};
  let createdAt = {};
  let closedAt = {};

  if (params.createdAtFrom) {
    createdAt = { ...createdAt, $gt: params.createdAtFrom };
    filter.createdAt = createdAt;
  }

  if (params.createdAtTo) {
    createdAt = { ...createdAt, $lt: params.createdAtTo };
    filter.createdAt = createdAt;
  }

  if (params.closedAtFrom) {
    closedAt = { ...closedAt, $gt: params.closedAtFrom };
    filter.closedAt = closedAt;
  }

  if (params.closedAtTo) {
    closedAt = { ...closedAt, $lt: params.closedAtTo };
    filter.closedAt = closedAt;
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

const RCFAQueries = {
  async rcfaList(_root, params: any, { models }: IContext) {
    const filter = await generateFilters(params);

    const list = paginate(
      models.RCFA.find(filter).sort({ createdAt: -1 }),
      params
    );

    const totalCount = models.RCFA.find(filter).countDocuments();

    return { list, totalCount };
  },

  async rcfaDetail(_root, args, { models }: IContext) {
    const rcfaItem = await models.RCFA.findOne(args);

    if (!rcfaItem) {
      throw new Error('Cannot find RCFA');
    }

    return rcfaItem;
  }
};

export default RCFAQueries;
