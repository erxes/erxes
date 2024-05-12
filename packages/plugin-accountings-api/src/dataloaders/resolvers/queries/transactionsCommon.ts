import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { IContext } from '../../../connectionResolver';

interface IQueryParams {
  ids?: string[];
  excludeIds?: boolean;
  status?: string;
  searchValue?: string;
  number?: string;
  accountIds?: string[];

  brand?: string;
  isOutBalance?: boolean,
  branchId: string;
  departmentId: string;
  currency: string;
  journal: string;

  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

const generateFilter = async (
  models,
  commonQuerySelector,
  params,
) => {
  const {
    ids,
    excludeIds,
    searchValue,
    number,
    accountIds,
    brand,
    isOutBalance,
    branchId,
    departmentId,
    currency,
    journal,
  } = params;
  const filter: any = commonQuerySelector;

  filter.status = {};

  return filter;
};

const transactionCommon = {
  async transactionDetail(
    _root,
    params: { id: string },
    { models }: IContext,
  ) {
    const { id } = params;
    let firstTr = await models.Transactions.getTransaction({ _id: id });
    if (firstTr.originId) {
      firstTr = await models.Transactions.getTransaction({ _id: firstTr.originId });
    }

    return await models.Transactions.find({ $or: [{ ptrId: firstTr.ptrId }, { parentId: firstTr.parentId }] })
  },

  async transactions(
    _root,
    params: IQueryParams & { page: number, perPage: number },
    { commonQuerySelector, models }: IContext,
  ) {
    const filter = await generateFilter(
      models,
      commonQuerySelector,
      params,
    );

    const { sortField, sortDirection, page, perPage, ids, excludeIds } = params;

    const pagintationArgs = { page, perPage };
    if (
      ids &&
      ids.length &&
      !excludeIds &&
      ids.length > (pagintationArgs.perPage || 20)
    ) {
      pagintationArgs.page = 1;
      pagintationArgs.perPage = ids.length;
    }

    let sort: any = { code: 1 };
    if (sortField) {
      sort = { [sortField]: sortDirection || 1 };
    }

    return await paginate(
      models.Transactions.find(filter).sort(sort).lean(),
      pagintationArgs,
    )
  },

  async transactionsCount(
    _root,
    params: IQueryParams,
    { commonQuerySelector, models }: IContext,
  ) {

    const filter = await generateFilter(
      models,
      commonQuerySelector,
      params,
    );

    return models.Transactions.find(filter).count();
  },
};

export default transactionCommon;
