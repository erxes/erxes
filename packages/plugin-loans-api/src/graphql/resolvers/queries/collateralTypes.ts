import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
const generateFilter = async (commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  return filter;
};

export const sortBuilder = (params) => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return { _id: 1 };
};

const collateralQueries = {
  /**
   * Collaterals for only main list
   */

  collateralTypesMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(commonQuerySelector);
    const list = await paginate(models.CollateralTypes.find(filter), {
      page: params.page,
      perPage: params.perPage
    });
    return {
      list,
      totalCount: models.CollateralTypes.find(filter).count()
    }
  },
  collateralTypeDetail: async (
    _root,
    {_id},
    { models }: IContext
  ) => {
    const collateralType = await models.CollateralTypes.findOne({_id})
    return collateralType
  }
};

export default collateralQueries;
