import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.searchValue) {
    filter.name = { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] };
  }

  if (params.hasParentId) {
    filter.parentId = { $exists: false };
  }

  return filter;
};

const purposeQueries = {
  /**
   * Purpose for only list
   */

  purposesMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);

    return {
      list: await paginate(models.LoanPurpose.find(filter), {
        page: params.page,
        perPage: params.perPage
      }),
      totalCount: await models.LoanPurpose.find(filter).countDocuments()
    };
  }
};

moduleRequireLogin(purposeQueries);

export default purposeQueries;
