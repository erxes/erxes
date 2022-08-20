import { checkPermission } from '@erxes/api-utils/src';
const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.categoryId) {
    filter.categoryId = params.categoryId;
  }

  if (params.searchValue) {
    filter.$or = [
      { certificate: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } },
      { vinNumber: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } }
    ];
  }

  if (params.productIds) {
    filter['collateralsData.collateralId'] = { $in: params.productIds };
  }

  return filter;
};

export const sortBuilder = params => {
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

  collateralsMain: async (
    _root,
    params,
    { commonQuerySelector, models, checkPermission, user }
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);
    const _page = Number(params.page || '1');
    const _limit = Number(params.perPage || '20');

    const list = await models.Contracts.aggregate([
      {
        $match: {}
      },
      { $unwind: '$collateralsData' },

      { $match: filter },
      { $sort: sortBuilder(params) },
      { $skip: (_page - 1) * _limit },
      { $limit: _limit }
    ]);

    return {
      list,
      totalCount: list.length
    };
  }
};
checkPermission(collateralQueries, 'collateralsMain', 'showCollaterals');

export default collateralQueries;
