import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
  buildingList: async (
    _root,
    {
      searchValue,
      cityId,
      districtId,
      quarterId,
      page,
      perPage
    }: {
      searchValue?: string;
      page?: number;
      perPage?: number;
      cityId?: string;
      districtId?: string;
      quarterId?: string;
    },
    { models }: IContext
  ) => {
    const filter: any = {};

    if (searchValue) {
      filter.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
    }

    if (cityId) {
      filter.cityId = cityId;
    }

    if (districtId) {
      filter.districtId = districtId;
    }

    if (quarterId) {
      filter.quarterId = quarterId;
    }

    return {
      list: paginate(
        models.Buildings.find(filter)
          .sort({ updatedAt: -1 })
          .lean(),
        {
          page: page || 1,
          perPage: perPage || 20
        }
      ),
      totalCount: models.Buildings.find(filter).count()
    };
  },

  buildings: async (
    _root,
    {
      searchValue,
      cityId,
      districtId,
      quarterId,
      page,
      perPage
    }: {
      searchValue?: string;
      page?: number;
      perPage?: number;
      cityId?: string;
      districtId?: string;
      quarterId?: string;
    },
    { models }: IContext
  ) => {
    const filter: any = {};

    if (searchValue) {
      filter.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
    }

    if (cityId) {
      filter.cityId = cityId;
    }

    if (districtId) {
      filter.districtId = districtId;
    }

    if (quarterId) {
      filter.quarterId = quarterId;
    }

    return paginate(models.Buildings.find(filter).lean(), {
      page: page || 1,
      perPage: perPage || 20
    });
  },

  buildingDetail: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.Buildings.getBuilding(_id);
  },

  buildingsByBounds: async (
    _root,
    { bounds }: { bounds: any },
    { models }: IContext
  ) => {
    console.log(bounds);

    return models.Buildings.find({
      location: {
        $geoWithin: { $polygon: bounds }
      }
    }).lean();
  }
};

export default queries;
