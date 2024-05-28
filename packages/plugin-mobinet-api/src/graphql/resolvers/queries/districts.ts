import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
  districts: async (
    _root,
    {
      searchValue,
      cityId,
      page,
      perPage
    }: {
      searchValue?: string;
      page?: number;
      perPage?: number;
      cityId?: string;
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

    return paginate(
      models.Districts.find(filter)
        .sort({ updatedAt: -1 })
        .lean(),
      {
        page: page || 1,
        perPage: perPage || 20
      }
    );
  },

  districtList: async (
    _root,
    {
      searchValue,
      cityId,
      page,
      perPage
    }: {
      searchValue?: string;
      page?: number;
      perPage?: number;
      cityId?: string;
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

    return {
      list: paginate(models.Districts.find(filter).lean(), {
        page: page || 1,
        perPage: perPage || 20
      }),
      totalCount: models.Districts.find(filter).count()
    };
  },

  districtDetail: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.Districts.getDistrict({ _id });
  },

  districtByCoordinates: async (
    _root,
    { lat, lng }: { lat: number; lng: number },
    { models }: IContext
  ) => {
    let dist = await models.Districts.findOne({
      geojson: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }
      }
    }).lean();

    if (dist) {
      return dist;
    }

    dist = await models.Districts.findOne({
      center: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: 10000
        }
      }
    }).lean();

    return dist;
  }
};

export default queries;
