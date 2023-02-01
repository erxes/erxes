import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const tripsQuery = {
  trips: async (
    _root,
    {
      status,
      dealId,
      customerId,
      driverId,
      page,
      perPage
    }: {
      status?: string;
      dealId?: string;
      customerId?: string;
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

    if (customerId) {
      filter.customerIds = customerId;
    }

    return {
      list: paginate(
        models.Trips.find(filter)
          .sort({ createdAt: -1 })
          .lean(),
        {
          page: page || 1,
          perPage: perPage || 20
        }
      ),
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
      categoryIds,
      currentLocation,
      searchRadius,
      date,
      dateType
    }: {
      routeId: string;
      carId: string;
      categoryIds: string[];
      date: string;
      dateType: 'createdAt' | 'ShipmentTime';
      currentLocation?: { lat: number; lng: number };
      searchRadius?: number;
    },
    { models, subdomain }: IContext
  ) => {
    return models.Trips.matchWithDeals(
      subdomain,
      carId,
      routeId,
      categoryIds,
      dateType,
      date,
      currentLocation,
      searchRadius
    );
  },

  tripByDealId: async (
    _root,
    { dealId, customerId }: { dealId: string; customerId: string },
    { models }: IContext
  ) => {
    const filter: any = { dealIds: dealId };

    if (customerId) {
      filter.customerIds = customerId;
    }

    return models.Trips.getTrip(filter);
  }
};

export default tripsQuery;
