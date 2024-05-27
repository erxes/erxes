import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';
import { ICar } from '../../../models/definitions/tumentech';

const advertisementQuery = {
  advertisements: async (
    _root,
    {
      driverId,
      carIds,
      productCategoryIds,
      status,
      type,
      startPlace,
      startDate,

      endPlace,
      endDate,

      generalPlace,
      shift,
      period,
      page,
      perPage,
      filterCarCategoryIds,
    }: {
      driverId: string;
      carIds: [string];
      productCategoryIds: [string];
      status: string;
      type: string;
      startPlace: string;
      startDate: Date;

      endPlace: string;
      endDate: Date;

      generalPlace: string;
      shift: string;
      period: string;

      filterCarCategoryIds: [string];
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
    if (productCategoryIds?.length > 0) {
      filter.productCategoryIds = { $in: productCategoryIds };
    }
    if (status) {
      filter.status = status;
    }

    if (type) {
      if (type === 'carCategory')
        filter.type = { $in: ['directional', 'regular'] };
      else filter.type = type;
    }

    if (startPlace) {
      filter.startPlace = startPlace;
    }
    if (startDate) {
      filter.startBegin = {
        $lte: startDate,
      };
      filter.startEnd = {
        $gte: startDate,
      };
    }
    if (endDate) {
      filter.endBegin = {
        $lte: endDate,
      };
      filter.endEnd = {
        $gte: endDate,
      };
    }

    if (endPlace) {
      filter.endPlace = endPlace;
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

    if (filterCarCategoryIds?.length > 0) {
      const carCategory = await models.CarCategories.find({
        _id: { $in: filterCarCategoryIds },
      });

      const _ids = carCategory.map((d) => d._id);
      const carFilter = {
        $or: [
          { parentCarCategoryId: { $in: _ids } },
          { carCategoryId: { $in: _ids } },
        ],
      };

      const carList = await models.Cars.find(carFilter).lean();
      filter.carIds = { $in: carList.map((x) => x?._id) };
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

  advertisementDetail: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Advertisement.findById(_id);
  },
};

export default advertisementQuery;
