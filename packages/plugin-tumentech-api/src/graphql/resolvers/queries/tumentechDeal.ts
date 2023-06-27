import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const tumentechDealsQuery = {
  tumentechDeals: async (
    _root,
    {
      dealId,
      page,
      perPage,
      dealIds
    }: {
      dealId?: string;
      dealIds?: string;
      page?: number;
      perPage?: number;
    },
    { models }: IContext
  ) => {
    const filter: any = {};

    if (dealIds) {
      filter.dealIds = { $in: dealIds.split(',') };
    }

    if (dealId) {
      filter.dealIds = dealId;
    }

    return {
      list: paginate(
        models.TumentechDeals.find(filter)
          .sort({ createdAt: -1 })
          .lean(),
        {
          page: page || 1,
          perPage: perPage || 20
        }
      ),
      totalCount: models.TumentechDeals.find(filter).count()
    };
  },

  tumentechDealDetail: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.TumentechDeals.getTumentechDeal(_id);
  }
};

export default tumentechDealsQuery;
