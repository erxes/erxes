import { paginate } from '@erxes/api-utils/src/core';
import { IContext } from '../../../connectionResolver';

const generateFilter = async (
  subdomain: string,
  params,
  commonQuerySelector,
  models
) => {
  const filter: any = commonQuerySelector;

  // filter.status = { $ne: "Deleted" };

  if (params.categoryId) {
    filter.categoryId = params.categoryId;
  }

  if (params.searchValue) {
    filter.searchText = { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] };
  }

  if (params.ids) {
    filter._id = { $in: params.ids };
  }

  return filter;
};

const adQueries = {
  cars: async (
    _root,
    params,
    { subdomain, commonQuerySelector, models }: IContext
  ) => {
    return paginate(
      models.ActiveDirectory.find(
        await generateFilter(subdomain, params, commonQuerySelector, models)
      ),
      {
        page: params.page,
        perPage: params.perPage,
      }
    );
  },
};

export default adQueries;
