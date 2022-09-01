import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const tripsQuery = {
  trips: async (
    _root,
    {
      status,
      dealId,
      driverId,
      page,
      perPage
    }: {
      status?: string;
      dealId?: string;
      driverId?: string;
      page?: number;
      perPage?: number;
    },
    { models }: IContext
  ) => {
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (driverId) {
      filter.driverId = driverId;
    }

    if (dealId) {
      filter.dealIds = dealId;
    }

    return {
      list: paginate(models.Trips.find(filter).lean(), {
        page: page || 1,
        perPage: perPage || 20
      }),
      totalCount: models.Trips.find(filter).count()
    };
  },

  activeTrips: async (_root, {}, { models }: IContext) => {
    return models.Trips.find({ status: 'active' }).lean();
  },

  tripDetail: async (_root, { _id }: { _id: string }, { models }: IContext) => {
    return models.Trips.getTrip({ _id });
  },

  matchingDeals: async (
    _root,
    {
      routeId,
      carId,
      categoryIds
    }: { routeId: string; carId: string; categoryIds: string[] },
    { models, subdomain }: IContext
  ) => {
    return models.Trips.matchWithDeals(subdomain, carId, routeId, categoryIds);
  }
};

export default tripsQuery;
