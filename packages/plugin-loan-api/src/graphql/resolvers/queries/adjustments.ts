import { paginate } from 'erxes-api-utils';

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  // if (params.searchValue) {
  //   filter.$or = [
  //     { name: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } },
  //     { code: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } },
  //     { number: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } },
  //   ]
  // }

  if (params.startDate) {
    filter.payDate = {
      $gte: new Date(params.startDate),
    };
  }

  if (params.endDate) {
    filter.payDate = {
      $lte: new Date(params.endDate),
    };
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

const adjustmentQueries = {
  /**
   * Adjustments list
   */

  adjustments: async (
    _root,
    params,
    { commonQuerySelector, models, checkPermission, user }
  ) => {
    await checkPermission('showContracts', user);
    return paginate(
      models.Adjustments.find(
        await generateFilter(params, commonQuerySelector)
      ),
      {
        page: params.page,
        perPage: params.perPage,
      }
    );
  },

  /**
   * Adjustments for only main list
   */

  adjustmentsMain: async (
    _root,
    params,
    { commonQuerySelector, models, checkPermission, user }
  ) => {
    await checkPermission('showContracts', user);
    const filter = await generateFilter(params, commonQuerySelector);

    return {
      list: paginate(
        models.Adjustments.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage,
        }
      ),
      totalCount: models.Adjustments.find(filter).count(),
    };
  },

  /**
   * Get one adjustment
   */

  adjustmentDetail: async (
    _root,
    { _id },
    { models, checkPermission, user }
  ) => {
    await checkPermission('showContracts', user);
    return models.Adjustments.getAdjustment(models, { _id });
  },
};

export default adjustmentQueries;
