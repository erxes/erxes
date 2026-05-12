import {
  ICursorPaginateParams,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  cursorPaginateAggregation,
  escapeRegExp,
  getPureDate,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IModels, IContext } from '~/connectionResolvers';
import { TR_STATUSES } from '@/accounting/@types/constants';
import { generateFilter as accountGenerateFilter } from './accounts';
import { checkAccountingPermission } from '../../../services/permissionChecker';
import { makeGetUserLevel } from '../../../utils/getUserLevel';


interface IQueryParams {
  ids?: string[];
  excludeIds?: boolean;
  status?: string;
  searchValue?: string;
  number?: string;
  ptrStatus: string;
  customerType?: string;
  customerId?: string;
  accountIds?: string[];
  accountKind?: string;
  accountExcludeIds?: boolean;
  accountStatus?: string;
  accountCategoryId?: string;
  accountSearchValue?: string;
  accountBrand?: string;
  accountIsTemp?: boolean;
  accountIsOutBalance?: boolean;
  accountBranchId: string;
  accountDepartmentId: string;
  accountCurrency: string;
  accountJournal: string;
  brandId?: string;
  isOutBalance?: boolean;
  branchId: string;
  departmentId: string;
  currency: string;
  journal: string;
  journals: string[];
  statuses: string[];
  createdUserId?: string;
  modifiedUserId?: string;
  startDate?: Date;
  endDate?: Date;
  startUpdatedDate?: Date;
  endUpdatedDate?: Date;
  startCreatedDate?: Date;
  endCreatedDate?: Date;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

interface IRecordsParams extends IQueryParams {
  groupRule: string[];
  folded: boolean;
}

// helpers due to duplicated lines
/** Retrieves all account IDs that match the filters */
const getAccountIds = async (
  models: IModels,
  params: IQueryParams,
  user: IUserDocument,
): Promise<string[]> => {
  const {
    accountIds,
    accountKind,
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

  const accountFilter = await accountGenerateFilter(models, {
    ids: accountIds,
    kind: accountKind,
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

  const accs = await models.Accounts.find(accountFilter, { _id: 1 }).lean();
  return accs.map(a => a._id);
};

/** Returns the list of account IDs the user is allowed to read */
async function getAllowedAccountIds(
  models: IModels,
  params: IQueryParams,
  user: IUserDocument,
  subdomain: string,
): Promise<string[]> {
  const accountIds = await getAccountIds(models, params, user);
  if (!accountIds.length) return [];

  const getUserLevel = makeGetUserLevel(subdomain);
  const allowed: string[] = [];
  for (const accountId of accountIds) {
    const { canRead } = await checkAccountingPermission(
      user._id,
      accountId,
      {},
      { Permissions: models.Permissions, Configs: models.Configs as any },
      getUserLevel,
    );
    if (canRead) allowed.push(accountId);
  }
  return allowed;
}

/** Builds the read permission MongoDB filter and a flag for post‑processing */
async function buildReadPermissionFilter(
  models: IModels,
  userId: string,
  accountId: string,
): Promise<{ mongoFilter: any; needsPostFilter: boolean }> {
  const perm = await models.Permissions.findOne({ userId, accountId }).lean() as
    | { read: string; level?: number }
    | null;

  if (!perm || perm.read === 'none') {
    return { mongoFilter: { _id: null }, needsPostFilter: false };
  }
  if (perm.read === 'own') {
    return {
      mongoFilter: { $or: [{ createdBy: userId }, { modifiedBy: userId }] },
      needsPostFilter: false,
    };
  }
  // ltLvl, lteLvl, gtLvl – needs post‑filter in memory
  return { mongoFilter: {}, needsPostFilter: true };
}

/**
 * Post‑filters an array of records (transactions or unwound details) according
 * to the level‑based read permission.  Returns the allowed subset.
 */
async function applyLevelPostFilter(
  records: any[],
  perm: { read: string; level?: number },
  getUserLevel: (userId: string) => Promise<number>,
): Promise<any[]> {
  const result: any[] = [];
  for (const rec of records) {
    const targetUserId = rec.modifiedBy || rec.createdBy;
    if (!targetUserId) continue;
    const targetLevel = await getUserLevel(targetUserId);
    const actorLevel = perm.level ?? 0;
    let ok = false;
    switch (perm.read) {
      case 'ltLvl':  ok = targetLevel <  actorLevel; break;
      case 'lteLvl': ok = targetLevel <= actorLevel; break;
      case 'gtLvl':  ok = targetLevel >  actorLevel; break;
      default:       ok = false;
    }
    if (ok) result.push(rec);
  }
  return result;
}

/**
 * Small shared guard: returns the essential permission context for a query.
 * Returns null if the user has no accessible accounts.
 */
async function getPermissionContext(
  models: IModels,
  params: IQueryParams,
  user: IUserDocument,
  subdomain: string,
) {
  const allowedAccountIds = await getAllowedAccountIds(models, params, user, subdomain);
  if (!allowedAccountIds.length) return null;

  const accountId = allowedAccountIds[0];
  const { mongoFilter, needsPostFilter } = await buildReadPermissionFilter(
    models,
    user._id,
    accountId,
  );
  if (mongoFilter._id === null) return null;

  const getUserLevel = makeGetUserLevel(subdomain);
  const perm = await models.Permissions.findOne({ userId: user._id, accountId }).lean() as { read: string; level?: number } | null;

  return { allowedAccountIds, mongoFilter, needsPostFilter, getUserLevel, perm };
}


const generateFilter = async (
  subdomain: string,
  models: IModels,
  params: IQueryParams,
  _user: IUserDocument,
) => {
  const {
    ids, excludeIds, searchValue, number,
    journal, journals, customerType, customerId,
    brandId, branchId, departmentId, currency,
    statuses, ptrStatus, status,
    createdUserId, modifiedUserId,
    startDate, endDate,
    startUpdatedDate, endUpdatedDate,
    startCreatedDate, endCreatedDate,
  } = params;
  const filter: any = {};

  if (createdUserId) filter.createdBy = createdUserId;
  if (modifiedUserId) filter.modifiedBy = modifiedUserId;

  const dateQry: any = {};
  if (startDate) dateQry.$gte = getPureDate(startDate);
  if (endDate) dateQry.$lte = getPureDate(endDate);
  if (Object.keys(dateQry).length) filter.date = dateQry;

  const createdDateQry: any = {};
  if (startCreatedDate) createdDateQry.$gte = getPureDate(startCreatedDate);
  if (endCreatedDate) createdDateQry.$lte = getPureDate(endCreatedDate);
  if (Object.keys(createdDateQry).length) filter.createdAt = createdDateQry;

  const updatedDateQry: any = {};
  if (startUpdatedDate) updatedDateQry.$gte = getPureDate(startUpdatedDate);
  if (endUpdatedDate) updatedDateQry.$lte = getPureDate(endUpdatedDate);
  if (Object.keys(updatedDateQry).length) filter.updatedAt = updatedDateQry;

  // will be replaced by allowed account IDs later
  filter['details.accountId'] = { $in: [] };

  if (journals?.length) filter.journal = { $in: journals };
  if (journal) filter.journal = journal;

  filter.status = statuses?.length ? { $in: statuses } : { $in: TR_STATUSES.ACTIVE };

  if (ids?.length) filter._id = { [excludeIds ? '$nin' : '$in']: ids };

  if (number) {
    filter.number = { $in: [new RegExp(`.*${escapeRegExp(number)}.*`, 'i')] };
  }
  if (searchValue) {
    filter.description = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');
  }
  if (ptrStatus) filter.ptrStatus = ptrStatus;
  if (status) filter.status = status;
  if (brandId) filter.scopeBrandIds = { $in: [brandId] };

  if (branchId) {
    const branches = await sendTRPCMessage({
      subdomain, pluginName: 'core', method: 'query',
      module: 'branches', action: 'findWithChild',
      input: { query: { _id: branchId }, fields: { _id: 1 } },
      defaultValue: [],
    });
    filter.branchId = { $in: branches.map(b => b._id) };
  }

  if (departmentId) {
    const departments = await sendTRPCMessage({
      subdomain, pluginName: 'core', method: 'query',
      module: 'departments', action: 'findWithChild',
      input: { query: { _id: departmentId }, fields: { _id: 1 } },
      defaultValue: [],
    });
    filter.departmentId = { $in: departments.map(d => d._id) };
  }

  if (customerType) filter.customerType = customerType;
  if (customerId) filter.customerId = customerId;
  if (currency) filter['details.currency'] = currency;

  return filter;
};

const transactionCommon = {
  async accTransactions(
    _root,
    params: IQueryParams & { page: number; perPage: number },
    { models, user, subdomain }: IContext,
  ) {
    const ctx = await getPermissionContext(models, params, user, subdomain);
    if (!ctx) return { list: [], totalCount: 0 };

    const baseFilter = await generateFilter(subdomain, models, params, user);
    baseFilter['details.accountId'] = { $in: ctx.allowedAccountIds };
    const combinedFilter = { ...baseFilter, ...ctx.mongoFilter };

    let results = await models.Transactions.find(combinedFilter).lean();

    if (ctx.needsPostFilter && ctx.perm) {
      results = await applyLevelPostFilter(results, ctx.perm, ctx.getUserLevel);
    }

    // pagination & sorting
    const { sortField, sortDirection, page, perPage, ids, excludeIds } = params;
    const paginationArgs = { page, perPage };
    if (ids?.length && !excludeIds && ids.length > (paginationArgs.perPage || 20)) {
      paginationArgs.page = 1;
      paginationArgs.perPage = ids.length;
    }
    results.sort((a, b) => (a[sortField || 'date'] > b[sortField || 'date'] ? 1 : -1));
    const start = (paginationArgs.page - 1) * paginationArgs.perPage;
    const paginated = results.slice(start, start + paginationArgs.perPage);
    return { list: paginated, totalCount: results.length };
  },

  async accTransactionDetail(_root, params: { _id: string }, { models, user, subdomain }: IContext) {
    const transaction = await models.Transactions.findOne({ _id: params._id }).lean();
    if (!transaction) throw new Error('Transaction not found');

    const accountId = (transaction as any).accountId || transaction.details?.[0]?.accountId;
    if (!accountId) throw new Error('Transaction has no associated account');

    const getUserLevel = makeGetUserLevel(subdomain);
    const { canRead } = await checkAccountingPermission(
      user._id, accountId,
      { createdBy: transaction.createdBy, modifiedBy: transaction.modifiedBy },
      { Permissions: models.Permissions, Configs: models.Configs as any },
      getUserLevel,
    );
    if (!canRead) throw new Error('Access denied');
    return transaction;
  },

  async accTransactionsMain(
    _root,
    params: IQueryParams & ICursorPaginateParams,
    { models, user, subdomain }: IContext,
  ) {
    const ctx = await getPermissionContext(models, params, user, subdomain);
    if (!ctx) return { list: [], totalCount: 0, pageInfo: { hasNextPage: false } };

    const baseFilter = await generateFilter(subdomain, models, params, user);
    baseFilter['details.accountId'] = { $in: ctx.allowedAccountIds };
    const combinedFilter = { ...baseFilter, ...ctx.mongoFilter };

    if (!ctx.needsPostFilter) {
      params.orderBy ??= { date: 1 };
      params.orderBy = { ...params.orderBy, ptrId: params.orderBy?.ptrId ?? 1 };
      return await cursorPaginate({
        model: models.Transactions,
        params,
        query: combinedFilter,
      });
    }

    // post‑filter & manual cursor pagination
    let results = await models.Transactions.find(combinedFilter).lean();
    results = await applyLevelPostFilter(results, ctx.perm!, ctx.getUserLevel);

    const cursor = params.cursor ? parseInt(params.cursor) : 0;
    const limit = params.limit || 20;
    const paginated = results.slice(cursor, cursor + limit);
    const hasNextPage = results.length > cursor + limit;
    return {
      list: paginated,
      totalCount: results.length,
      pageInfo: { hasNextPage, endCursor: (cursor + limit).toString() },
    };
  },

  async accTransactionsCount(
    _root,
    params: IQueryParams,
    { models, user, subdomain }: IContext,
  ) {
    const ctx = await getPermissionContext(models, params, user, subdomain);
    if (!ctx) return 0;

    const baseFilter = await generateFilter(subdomain, models, params, user);
    baseFilter['details.accountId'] = { $in: ctx.allowedAccountIds };
    const combinedFilter = { ...baseFilter, ...ctx.mongoFilter };

    if (!ctx.needsPostFilter) {
      return models.Transactions.find(combinedFilter).countDocuments();
    }

    let results = await models.Transactions.find(combinedFilter).lean();
    results = await applyLevelPostFilter(results, ctx.perm!, ctx.getUserLevel);
    return results.length;
  },

  async accTrRecordsMain(
    _root,
    params: IRecordsParams & ICursorPaginateParams,
    { models, user, subdomain }: IContext,
  ) {
    const ctx = await getPermissionContext(models, params, user, subdomain);
    if (!ctx) return { list: [], totalCount: 0, pageInfo: { hasNextPage: false } };

    const baseFilter = await generateFilter(subdomain, models, params, user);
    baseFilter['details.accountId'] = { $in: ctx.allowedAccountIds };
    const combinedFilter = { ...baseFilter, ...ctx.mongoFilter };

    if (!ctx.needsPostFilter) {
      params.orderBy ??= { date: 1 };
      params.orderBy = { ...params.orderBy, ptrId: params.orderBy?.ptrId ?? 1, _id: 1 };
      return await cursorPaginateAggregation({
        model: models.Transactions,
        pipeline: [
          { $match: combinedFilter },
          { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
          {
            $replaceRoot: {
              newRoot: { $mergeObjects: ['$$ROOT', { _id: { $concat: ['$_id', '-', '$details._id'] } }, { trId: '$_id' }] },
            },
          },
        ],
        params,
        formatter: { date: 'date', createAt: 'date' },
      });
    }

    // post‑filter with manual cursor
    let results = await models.Transactions.aggregate([
      { $match: combinedFilter },
      { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ['$$ROOT', { _id: { $concat: ['$_id', '-', '$details._id'] } }, { trId: '$_id' }] },
        },
      },
    ]);
    results = await applyLevelPostFilter(results, ctx.perm!, ctx.getUserLevel);

    const cursor = params.cursor ? parseInt(params.cursor) : 0;
    const limit = params.limit || 20;
    const paginated = results.slice(cursor, cursor + limit);
    const hasNextPage = results.length > cursor + limit;
    return {
      list: paginated,
      totalCount: results.length,
      pageInfo: { hasNextPage, endCursor: (cursor + limit).toString() },
    };
  },

  async accTrRecords(
    _root,
    params: IRecordsParams & { page: number; perPage: number },
    { models, user, subdomain }: IContext,
  ) {
    const ctx = await getPermissionContext(models, params, user, subdomain);
    if (!ctx) return [];

    const baseFilter = await generateFilter(subdomain, models, params, user);
    baseFilter['details.accountId'] = { $in: ctx.allowedAccountIds };
    const combinedFilter = { ...baseFilter, ...ctx.mongoFilter };

    const pipeline: any[] = [
      { $match: combinedFilter },
      { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ['$$ROOT', { _id: { $concat: ['$_id', '-', '$details._id'] } }, { trId: '$_id' }] },
        },
      },
    ];

    if (!ctx.needsPostFilter) {
      const { sortField, sortDirection, page, perPage, ids, excludeIds } = params;
      const pageArgs = { page, perPage };
      if (ids?.length && !excludeIds && ids.length > (pageArgs.perPage || 20)) {
        pageArgs.page = 1;
        pageArgs.perPage = ids.length;
      }
      const $limit = Number(pageArgs.perPage || '20');
      const $skip = (Number(pageArgs.page || '1') - 1) * $limit;
      const $sort = sortField ? { [sortField]: sortDirection ?? 1 } : { date: 1 };
      pipeline.push({ $sort }, { $skip }, { $limit });
      return await models.Transactions.aggregate(pipeline);
    }

    // post‑filter then manual pagination
    let results = await models.Transactions.aggregate(pipeline);
    results = await applyLevelPostFilter(results, ctx.perm!, ctx.getUserLevel);

    const { sortField, sortDirection, page, perPage } = params;
    const pageArgs = { page: page || 1, perPage: perPage || 20 };
    const $limit = Number(pageArgs.perPage || '20');
    const $skip = (Number(pageArgs.page || '1') - 1) * $limit;
    results.sort((a, b) => (a[sortField || 'date'] > b[sortField || 'date'] ? 1 : -1));
    return results.slice($skip, $skip + $limit);
  },

  async accTrRecordsCount(
    _root,
    params: IRecordsParams,
    { models, subdomain, user }: IContext,
  ) {
    const ctx = await getPermissionContext(models, params, user, subdomain);
    if (!ctx) return 0;

    const baseFilter = await generateFilter(subdomain, models, params, user);
    baseFilter['details.accountId'] = { $in: ctx.allowedAccountIds };
    const combinedFilter = { ...baseFilter, ...ctx.mongoFilter };

    if (!ctx.needsPostFilter) {
      const res = await models.Transactions.aggregate([
        { $match: combinedFilter },
        { $unwind: '$details' },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
      return res[0]?.count ?? 0;
    }

    let results = await models.Transactions.aggregate([
      { $match: combinedFilter },
      { $unwind: '$details' },
      { $replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', { trId: '$_id' }] } } },
    ]);
    results = await applyLevelPostFilter(results, ctx.perm!, ctx.getUserLevel);
    return results.length;
  },
};

export default transactionCommon;