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
      carCategoryId,
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

      carCategoryId: string;
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
    if (productCategoryIds) {
      filter.categoryIds = { $in: productCategoryIds };
    }
    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
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

    if (carCategoryId) {
      // carCategoryId: field({ type: String, label: 'Category', index: true }),
      // parentCarCategoryId:

      const carCategory = await models.CarCategories.findById(carCategoryId);
      const isParentCarCategoryId = carCategory?.parentId ? false : true;

      let carFilter = {};
      if (isParentCarCategoryId) {
        carFilter = { parentCarCategoryId: carCategoryId };
      } else {
        carFilter = { carCategoryId: carCategoryId };
      }
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
