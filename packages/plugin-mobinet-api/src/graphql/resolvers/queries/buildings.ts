import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
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

    return {
      list: paginate(models.Buildings.find(filter).lean(), {
        page: page || 1,
        perPage: perPage || 20
      }),
      totalCount: models.Buildings.find(filter).count()
    };
  },

  buildingDetail: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.Buildings.getBuilding(_id);
  }
};

export default queries;
