import { paginate } from '@erxes/api-utils/src/core';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const topupQueries = {
  topupHistory: async (
    _root,
    { customerId, page, perPage },
    { models }: IContext
  ) => {
    const query: any = {};

    if (customerId) {
      query.customerId = customerId;
    }

    const totalCount = await models.Topups.find(query).countDocuments();

    const list = await paginate(
      models.Topups.find(query).sort({ createdAt: -1 }),
      { page, perPage }
    );

    return { list, totalCount };
  }
};

// checkPermission(topupQueries, 'topupHistory', 'showTopups');

export default topupQueries;
