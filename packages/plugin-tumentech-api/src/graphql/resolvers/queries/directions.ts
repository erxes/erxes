import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const directionsQuery = {
  directions: async (
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
      list: paginate(models.Directions.find(filter).lean(), {
        page: page || 1,
        perPage: perPage || 20
      }),
      totalCount: models.Directions.find(filter).count()
    };
  }
};

export default directionsQuery;
