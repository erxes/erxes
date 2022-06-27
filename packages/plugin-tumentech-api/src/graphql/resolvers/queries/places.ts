import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src';

const placesQuery = {
  places: async (
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
      list: paginate(models.Places.find(filter).lean(), {
        page: page || 1,
        perPage: perPage || 20
      }),
      totalCount: models.Places.find(filter).count()
    };
  }
};

export default placesQuery;
