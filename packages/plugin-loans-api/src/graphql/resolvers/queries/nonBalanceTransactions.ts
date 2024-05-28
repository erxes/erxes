import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.ids) {
    filter._id = { $in: params.ids };
  }

  if (params.contractId) {
    filter.contractId = params.contractId;
  }

  if (params.customerId) {
    filter.customerId = params.customerId;
  }

  if (params.startDate) {
    filter.createdAt = {
      $gte: new Date(params.startDate)
    };
  }

  if (params.endDate) {
    filter.createdAt = {
      $lte: new Date(params.endDate)
    };
  }

  if (params.startDate && params.endDate) {
    filter.createdAt = {
      $and: [
        { $gte: new Date(params.startDate) },
        { $lte: new Date(params.endDate) }
      ]
    };
  }

  return filter;
};

export const sortBuilder = params => {
  const {sortField} = params;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const nonBalanceTransactionQueries = {
  /**
   * Non Balance Transactions list
   */
  nonBalanceTransactions: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    return paginate(
      models.NonBalanceTransactions.find(
        await generateFilter(params, commonQuerySelector)
      ),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },
  nonBalanceTransactionsMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);
    return {
      list: await paginate(
        models.NonBalanceTransactions.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: await models.NonBalanceTransactions.find(filter).countDocuments()
    };
  },

    /**
   * Get one transaction
   */

  nonBalancTransactionDetail: async (_root, { _id }, { models }: IContext) => {
      return models.NonBalanceTransactions.getNonBalanceTransaction({ _id });
    },
};

checkPermission(nonBalanceTransactionQueries, 'nonBalanceTransactions', 'showNonBalanceTransactions');
checkPermission(nonBalanceTransactionQueries, 'nonBalanceTransactionsMain', 'showNonBalanceTransactions');
checkPermission(nonBalanceTransactionQueries, 'nonBalancTransactionDetail', 'showNonBalanceTransactions');


export default nonBalanceTransactionQueries;
