import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.searchValue) {
    filter.$or = [
      { name: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } },
      { code: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } },
      { number: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } }
    ];
  }

  if (params.ids?.length) {
    filter._id = { [params.excludeIds ? '$nin' : '$in']: params.ids };
  }
  
  if (params.productType) {
    filter.productType = params.productType;
  }

  if (![undefined, null, ''].includes(params.isDeposit)) {
    filter.isDeposit = params.isDeposit && { $eq: true } || { $ne: true };
  }
  return filter;
};

export const sortBuilder = (params) => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const contractTypeQueries = {
  /**
   * ContractTypes list
   */
  savingsContractTypes: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    return paginate(
      models.ContractTypes.find(
        await generateFilter(params, commonQuerySelector)
      ),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  /**
   * ContractTypes for only main list
   */

  savingsContractTypesMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);

    return {
      list: await paginate(
        models.ContractTypes.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: await models.ContractTypes.find(filter).countDocuments()
    };
  },

  /**
   * Get one contractType
   */

  savingsContractTypeDetail: async (_root, { _id }, { models }: IContext) => {
    return models.ContractTypes.getContractType({ _id });
  }
};

moduleRequireLogin(contractTypeQueries);

export default contractTypeQueries;
