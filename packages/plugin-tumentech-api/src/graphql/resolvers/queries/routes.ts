import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src';

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
    const filter: { $or?: any[] } = {};

    // if (searchValue) {
    //   const regexOption = {
    //     $regex: `.*${searchValue.trim()}.*`,
    //     $options: 'i'
    //   };

    //   filter.$or = [
    //     {
    //       placeA: regexOption
    //     },
    //     {
    //       placeB: regexOption
    //     }
    //   ];
    // }

    return paginate(models.Routes.find(filter).lean(), {
      page: page || 1,
      perPage: perPage || 20
    });
  }
};

export default routesQuery;
