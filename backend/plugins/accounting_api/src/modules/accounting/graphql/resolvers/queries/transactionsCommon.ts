import { IUserDocument } from 'erxes-api-shared/core-types';
import { defaultPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { IModels, IContext } from '~/connectionResolvers';
import { TR_STATUSES } from '@/accounting/@types/constants';
import { ITransactionDocument } from '@/accounting/@types/transaction';
import { generateFilter as accountGenerateFilter } from './accounts';
import { checkPermissionTrs } from '../../../utils/trPermissions';

interface IQueryParams {
  ids?: string[];
  excludeIds?: boolean;
  status?: string;
  searchValue?: string;
  number?: string;
  ptrStatus: string;

  accountIds?: string[];
  accountType: string;
  accountExcludeIds?: boolean;
  accountStatus?: string;
  accountCategoryId?: string;
  accountSearchValue?: string;
  accountBrand?: string;
  accountIsTemp?: boolean,
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

interface IRecordsParams extends IQueryParams {
  groupRule: string[];
  folded: boolean;
}

const getAccountIds = async (models: IModels, params: IQueryParams, user: IUserDocument): Promise<string[]> => {
  const {
    accountIds,
    accountType,
    accountExcludeIds,
    accountStatus,
    accountCategoryId,
    accountSearchValue,
    accountBrand,
    accountIsTemp,
    accountIsOutBalance,
    accountBranchId,
    accountDepartmentId,
    accountCurrency,
    accountJournal,
  } = params;

  const accountFilter: any = await accountGenerateFilter(models, {
    ids: accountIds,
    type: accountType,
    excludeIds: accountExcludeIds,
    status: accountStatus,
    categoryId: accountCategoryId,
    searchValue: accountSearchValue,
    brand: accountBrand,
    isTemp: accountIsTemp,
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
    ptrStatus,
    status
  } = params;
  const filter: any = {};

  filter['details.accountId'] = { $in: await getAccountIds(models, params, user) }

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

  if (ptrStatus) {
    filter.ptrStatus = ptrStatus;
  }

  if (status) {
    filter.status = status;
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
  async accTransactionDetail(
    _root,
    params: { _id: string },
    { models, user }: IContext,
  ) {
    const { _id } = params;
    let firstTr = await models.Transactions.getTransaction({ $or: [{ _id }, { parentId: _id }] });

    if (firstTr.originId) {
      firstTr = await models.Transactions.getTransaction({ _id: firstTr.originId });
    }

    const relatedTrs: ITransactionDocument[] = await models.Transactions.find({ $or: [{ ptrId: firstTr.ptrId }, { parentId: firstTr.parentId }] }).lean();

    return await checkPermissionTrs(models, relatedTrs, user);
  },

  async accTransactions(
    _root,
    params: IQueryParams & { page: number, perPage: number },
    { models, user }: IContext,
  ) {
    const filter = await generateFilter(
      models,
      params,
      user
    );

    const { sortField, sortDirection, page, perPage, ids, excludeIds } = params;

    const pagintationArgs = { page, perPage };
    if (
      ids?.length &&
      !excludeIds &&
      ids.length > (pagintationArgs.perPage || 20)
    ) {
      pagintationArgs.page = 1;
      pagintationArgs.perPage = ids.length;
    }

    let sort: any = { date: 1 };
    if (sortField) {
      sort = { [sortField]: sortDirection ?? 1 };
    }

    return await defaultPaginate(
      models.Transactions.find(filter).sort({ ...sort, parentId: 1, ptrId: 1 }).lean(),
      pagintationArgs
    )

  },

  async accTransactionsCount(
    _root,
    params: IQueryParams,
    { models, user }: IContext,
  ) {

    const filter = await generateFilter(
      models,
      params,
      user,
    );

    return models.Transactions.find(filter).countDocuments();
  },

  async accTrRecords(
    _root,
    params: IRecordsParams & { page: number, perPage: number },
    { models, user }: IContext,
  ) {
    const filter = await generateFilter(
      models,
      params,
      user,
    );
    const { sortField, sortDirection, page, perPage, ids, excludeIds } = params;

    const pageArgs = { page, perPage };
    if (
      ids?.length &&
      !excludeIds &&
      ids.length > (pageArgs.perPage || 20)
    ) {
      pageArgs.page = 1;
      pageArgs.perPage = ids.length;
    }
    const $limit = Number(pageArgs.perPage || '20');
    const $skip = (Number(pageArgs.page || '1') - 1) * $limit;

    let $sort: any = { date: 1 };
    if (sortField) {
      $sort = { [sortField]: sortDirection ?? 1 };
    }

    return await models.Transactions.aggregate([
      { $match: { ...filter } },
      { $sort },
      { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
      { $skip },
      { $limit },
      { "$replaceRoot": { "newRoot": { $mergeObjects: ['$$ROOT', { _id: { $concat: ['$_id', '@', '$details._id'] } }, { trId: '$_id' }] } } }
      // accountaar groupleh ingesneer shortDetailiig bii bolgoh
      // { $group: { _id: '$details.accountId', } }
    ])

  },

  async accTrRecordsCount(
    _root,
    params: IRecordsParams,
    { models, user }: IContext,
  ) {
    const filter = await generateFilter(
      models,
      params,
      user,
    );

    const count = await models.Transactions.aggregate([
      { $match: { ...filter } },
      { $unwind: '$details' },
      { $group: { _id: null, count: { $sum: 1 } } },
      { $project: { _id: 0 } }
    ]);
    return count[0].count;
  }
};

export default transactionCommon;
