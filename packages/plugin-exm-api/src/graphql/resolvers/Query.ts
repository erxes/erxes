import { checkPermission } from '@erxes/api-utils/src/permissions';

import { IContext } from '../../connectionResolver';

const generateFilters = async (params: any, models) => {
  let filter: any = {};

  if (params.searchValue) {
    const searchValue = { $regex: new RegExp(params.searchValue, 'i') };

    filter = {
      ...filter,
      $or: [{ name: searchValue }]
    };
  }

  if (params?.categoryId) {
    filter.categoryId = params.categoryId;
  }

  return filter;
};

const exmQueries = {
  /**
   * Group engage messages counts by kind, status, tag
   */
  async exms(_root, params: any, { models }: IContext) {
    const filter = await generateFilters(params, models);

    return {
      list: await models.Exms.find(filter).sort({ createdAt: -1 }),
      totalCount: await models.Exms.countDocuments(filter)
    };
  },

  async exmGet(_root, _args, { models }) {
    return models.Exms.findOne().sort({ createdAt: -1 });
  },

  async exmCoreCategories(_root, params: any, { models }: IContext) {
    return models.ExmCategories.find();
  },
  async exmCoreCategoriesTotalCount(_root, params: any, { models }: IContext) {
    return await models.ExmCategories.countDocuments();
  }
};

checkPermission(exmQueries, 'exms', 'showExms', []);
checkPermission(exmQueries, 'exmGet', 'showExms', []);

export default exmQueries;
