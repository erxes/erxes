import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const routesQuery = {
  routes: async (
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
      list: paginate(models.Routes.find(filter).lean(), {
        page: page || 1,
        perPage: perPage || 20
      }),
      totalCount: models.Routes.find(filter).count()
    };
  },

  routeDetail: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.Routes.getRoute({ _id });
  }
};

export default routesQuery;
