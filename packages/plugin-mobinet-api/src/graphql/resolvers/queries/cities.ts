import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const citiesQuery = {
  cityList: async (
    _root,
    {
      searchValue,
      page,
      perPage
    }: { searchValue?: string; page?: number; perPage?: number },
    { models }: IContext
  ) => {
    const filter: any = {};

    if (searchValue) {
      filter.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
    }

    return {
      list: paginate(
        models.Cities.find(filter)
          .sort({ updatedAt: -1 })
          .lean(),
        {
          page: page || 1,
          perPage: perPage || 20
        }
      ),
      totalCount: models.Cities.find(filter).count()
    };
  },

  cityDetail: async (_root, { _id }: { _id: string }, { models }: IContext) => {
    return models.Cities.getCity(_id);
  },

  cities: async (
    _root,
    { searchValue }: { searchValue?: string },
    { models }: IContext
  ) => {
    const filter: any = {};

    if (searchValue) {
      filter.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
    }

    return models.Cities.find(filter).lean();
  },

  cityByCoordinates: async (
    _root,
    { lat, lng }: { lat: number; lng: number },
    { models }: IContext
  ) => {
    return models.Cities.findOne({
      center: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: 5000
        }
      }
    }).lean();
  }
};

export default citiesQuery;
