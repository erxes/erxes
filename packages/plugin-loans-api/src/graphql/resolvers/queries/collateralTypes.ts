import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
const generateFilter = async (commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  return filter;
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
      totalCount: models.CollateralTypes.find(filter).countDocuments()
    };
  },
  collateralTypes: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(commonQuerySelector);
    return await paginate(models.CollateralTypes.find(filter), {
      page: params.page,
      perPage: params.perPage
    });
  },
  collateralTypeDetail: async (_root, { _id }, { models }: IContext) => {
    return await models.CollateralTypes.findOne({ _id });
  }
};

export default collateralQueries;
