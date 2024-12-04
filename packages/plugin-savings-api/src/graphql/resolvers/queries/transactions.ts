import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const generateFilter = async (models, params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.searchValue) {
    const contracts = await models.Contracts.find(
      { number: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } },
      { _id: 1 }
    );

    filter.$or = [
      { contractId: { $in: contracts.map((item) => item._id) } },
      { description: new RegExp(`.*${params.searchValue}.*`, "i") },
      { total: params.searchValue }
    ];
  }

  if (params.ids) {
    filter._id = { $in: params.ids };
  }

  if (params.contractId) {
    filter.contractId = params.contractId;
  }

  if (params.companyId) {
    filter.companyId = params.companyId;
  }

  if (params.customerId) {
    filter.customerId = params.customerId;
  }

  if (params.startDate) {
    filter.payDate = {
      $gte: new Date(params.startDate)
    };
  }

  if (params.endDate) {
    filter.payDate = {
      $lte: new Date(params.endDate)
    };
  }

  if (params.startDate && params.endDate) {
    filter.payDate = {
      $gte: new Date(params.startDate),
      $lte: new Date(params.endDate)
    };
  }

  if (params.payDate === 'today') {
    filter.payDate = { $gte: new Date(), $lte: new Date() };
  }

  if (params.contractHasnt) {
    filter.contractId = { $in: ['', null] };
  }

  if (params.transactionType) {
    filter.transactionType = params.transactionType;
  }

  if (params.description) {
    filter.description = {
      $in: [new RegExp(`.*${params.description}.*`, 'i')]
    };
  }

  if (params.total) {
    filter.total = params.total;
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

const transactionQueries = {
  /**
   * Transactions list
   */
  savingsTransactions: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    return paginate(
      models.Transactions.find(
        await generateFilter(models, params, commonQuerySelector)
      ),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },
  clientSavingsTransactions: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    if (!params.contractId && !params.customerId) {
      throw new Error('Customer not found');
    }

    return paginate(
      models.Transactions.find(
        await generateFilter(models, params, commonQuerySelector)
      ),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  /**
   * Transactions for only main list
   */

  savingsTransactionsMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(models, params, commonQuerySelector);

    return {
      list: await paginate(
        models.Transactions.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: await models.Transactions.find(filter).countDocuments()
    };
  },

  /**
   * Get one transaction
   */

  savingsTransactionDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Transactions.getTransaction({ _id });
  }
};

checkPermission(transactionQueries, 'transactions', 'showTransactions');
checkPermission(transactionQueries, 'transactionsMain', 'showTransactions');
checkPermission(transactionQueries, 'transactionDetail', 'showTransactions');

export default transactionQueries;
