import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const advertisementQuery = {
  advertisements: async (
    _root,
    {
      driverId,
      carIds,
      categoryIds,
      status,

      startPlace,
      startBegin,
      startEnd,

      endPlace,
      endBegin,
      endEnd,

      generalPlace,
      shift,
      period,
      page,
      perPage,
    }: {
      driverId: string;
      carIds: [string];
      categoryIds: [string];
      status: string;

      startPlace: string;
      startBegin: Date;
      startEnd: Date;

      endPlace: string;
      endBegin: Date;
      endEnd: Date;

      generalPlace: string;
      shift: string;
      period: string;
      page?: number;
      perPage?: number;
    },
    { models }: IContext,
  ) => {
    const filter: any = {};

    if (driverId) {
      filter.driverId = driverId;
    }
    if (carIds) {
      filter.carIds = { $in: carIds };
    }
    if (categoryIds) {
      filter.categoryIds = { $in: categoryIds };
    }
    if (status) {
      filter.status = status;
    }

    if (startPlace) {
      filter.startPlace = startPlace;
    }

    if (startBegin) {
    }
    if (startEnd) {
    }

    if (endPlace) {
      filter.endPlace = endPlace;
    }
    if (endBegin) {
    }
    if (endEnd) {
    }

    if (generalPlace) {
      filter.generalPlace = generalPlace;
    }
    if (shift) {
      filter.shift = shift;
    }
    if (period) {
      filter.period = period;
    }

    return {
      list: paginate(
        models.Advertisement.find(filter).sort({ createdAt: -1 }).lean(),
        {
          page: page || 1,
          perPage: perPage || 20,
        },
      ),
      totalCount: models.Advertisement.find(filter).count(),
    };
  },

  activeAdvertisement: async (_root, {}, { models }: IContext) => {
    return models.Trips.find({ status: 'active' }).lean();
  },

  advertisementDetail: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Trips.getTrip({ _id });
  },
};

export default advertisementQuery;
