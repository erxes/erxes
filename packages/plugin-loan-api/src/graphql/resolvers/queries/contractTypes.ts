import { paginate } from 'erxes-api-utils';
import { checkPermission } from '@erxes/api-utils/src';

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.searchValue) {
    filter.$or = [
      { name: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } },
      { code: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } },
      { number: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } }
    ];
  }

  // if (params.ids) {
  //   filter._id = { $in: params.ids };
  // }

  return filter;
};

export const sortBuilder = params => {
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
  contractTypes: async (
    _root,
    params,
    { commonQuerySelector, models, checkPermission, user }
  ) => {
    await checkPermission('showContracts', user);
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

  contractTypesMain: async (
    _root,
    params,
    { commonQuerySelector, models, checkPermission, user }
  ) => {
    await checkPermission('showContracts', user);
    const filter = await generateFilter(params, commonQuerySelector);

    return {
      list: paginate(
        models.ContractTypes.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: models.ContractTypes.find(filter).count()
    };
  },

  /**
   * Get one contractType
   */

  contractTypeDetail: async (
    _root,
    { _id },
    { models, checkPermission, user }
  ) => {
    await checkPermission('showContracts', user);
    return models.ContractTypes.getContractType(models, { _id });
  }
};

checkPermission(contractTypeQueries, 'contractTypes', 'showContracts');
checkPermission(contractTypeQueries, 'contractTypesMain', 'showContracts');
checkPermission(contractTypeQueries, 'contractTypeDetail', 'showContracts');

export default contractTypeQueries;
