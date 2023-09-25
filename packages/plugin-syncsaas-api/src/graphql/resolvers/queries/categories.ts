import { paginate } from '@erxes/api-utils/src';
import { IContext, IModels } from '../../../connectionResolver';

const generateFilters = async (params: any, models: IModels) => {
  let filter: any = {};

  if (!!params?.ids?.length) {
    filter._id = { $in: params.ids };
  }

  if (!!params?.excludeIds?.length) {
    filter._id = { ...(filter._id || {}), $nin: params.excludeIds };
  }

  if (params.searchValue) {
    const searchValue = { $regex: new RegExp(params.searchValue, 'i') };

    filter = {
      ...filter,
      name: searchValue
    };
  }

  return filter;
};

const categoriesQueries = {
  async syncedSaasCategories(_root, params: any, { models }: IContext) {
    const filter = await generateFilters(params, models);

    return paginate(models.Categories.find(filter), params);
  },
  async syncedSaasCategoriesTotalCount(
    _root,
    params: any,
    { models }: IContext
  ) {
    const filter = await generateFilters(params, models);

    return await models.Categories.countDocuments(filter);
  }
};

export default categoriesQueries;
