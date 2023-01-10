import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
  quarterList: async (
    _root,
    {
      searchValue,
      cityId,
      districtId,
      page,
      perPage
    }: {
      searchValue?: string;
      page?: number;
      perPage?: number;
      cityId?: string;
      districtId?: string;
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

    return {
      list: paginate(
        models.Quarters.find(filter)
          .sort({ updatedAt: -1 })
          .lean(),
        {
          page: page || 1,
          perPage: perPage || 20
        }
      ),
      totalCount: models.Quarters.find(filter).count()
    };
  },

  quarters: async (
    _root,
    {
      searchValue,
      cityId,
      districtId,
      page,
      perPage
    }: {
      searchValue?: string;
      page?: number;
      perPage?: number;
      cityId?: string;
      districtId?: string;
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

    return paginate(models.Quarters.find(filter).lean(), {
      page: page || 1,
      perPage: perPage || 20
    });
  },

  quarterDetail: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.Quarters.getQuarter(_id);
  }
};

export default queries;
