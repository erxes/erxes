import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext, IModels } from '../../../connectionResolver';
import { TR_STATUSES } from '../../../models/definitions/constants';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { generateFilter as accountGenerateFilter } from './accounts';

interface IQueryParams {
  ids?: string[];
  excludeIds?: boolean;
  status?: string;
  searchValue?: string;
  number?: string;

  accountIds?: string[];
  accountType: string;
  accountExcludeIds?: boolean;
  accountStatus?: string;
  accountCategoryId?: string;
  accountSearchValue?: string;
  accountBrand?: string;
  accountIsOutBalance?: boolean,
  accountBranchId: string;
  accountDepartmentId: string;
  accountCurrency: string;
  accountJournal: string;

  brandId?: string;
  isOutBalance?: boolean,
  branchId: string;
  departmentId: string;
  currency: string;
  journal: string;
  statuses: string[];

  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

const getAccountIds = async (models: IModels, commonQuerySelector, params: IQueryParams, user: IUserDocument): Promise<string[]> => {
  const {
    accountIds,
    accountType,
    accountExcludeIds,
    accountStatus,
    accountCategoryId,
    accountSearchValue,
    accountBrand,
    accountIsOutBalance,
    accountBranchId,
    accountDepartmentId,
    accountCurrency,
    accountJournal,
  } = params;

  const accountFilter: any = await accountGenerateFilter(models, commonQuerySelector, {
    ids: accountIds,
    type: accountType,
    excludeIds: accountExcludeIds,
    status: accountStatus,
    categoryId: accountCategoryId,
    searchValue: accountSearchValue,
    brand: accountBrand,
    isOutBalance: accountIsOutBalance,
    branchId: accountBranchId,
    departmentId: accountDepartmentId,
    currency: accountCurrency,
    journal: accountJournal,
  }, user);

  const accounts = await models.Accounts.find({ ...accountFilter }, { _id: 1 }).lean();
  return accounts.map(a => a._id);
}

const generateFilter = async (
  models: IModels,
  commonQuerySelector: any,
  params: IQueryParams,
  user: IUserDocument,
) => {
  const {
    ids,
    excludeIds,
    searchValue,
    number,
    journal,
    brandId,
    branchId,
    departmentId,
    currency,
    statuses,
  } = params;
  const filter = commonQuerySelector;

  filter.accountId = { $in: await getAccountIds(models, commonQuerySelector, params, user) }

  if (journal) {
    filter.journal = journal
  }

  if (statuses?.length) {
    filter.status = { $in: statuses }
  } else {
    filter.status = { $in: TR_STATUSES.ACTIVE }
  }

  if (ids?.length) {
    filter._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  if (number) {
    const regex = new RegExp(`.*${escapeRegExp(number)}.*`, 'i');
    filter.number = { $in: [regex] };
  }

  if (searchValue) {
    const regex = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');
    filter.description = { $in: [regex] };
  }

  if (brandId) {
    filter.scopeBrandIds = { $in: [brandId] }
  }

  if (branchId) {
    filter.branchId = { $in: [branchId] }
  }

  if (departmentId) {
    filter.departmentId = { $in: [departmentId] }
  }

  if (currency) {
    filter['trDetail.currency'] = currency;
  }

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
    { commonQuerySelector, models, user }: IContext,
  ) {
    const filter = await generateFilter(
      models,
      commonQuerySelector,
      params,
      user
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
      sort = { [sortField]: sortDirection ?? 1 };
    }

    return await paginate(
      models.Transactions.find(filter).sort(sort).lean(),
      pagintationArgs,
    )
  },

  async transactionsCount(
    _root,
    params: IQueryParams,
    { commonQuerySelector, models, user }: IContext,
  ) {

    const filter = await generateFilter(
      models,
      commonQuerySelector,
      params,
      user,
    );

    return models.Transactions.find(filter).count();
  },
};

export default transactionCommon;
