import {
  ICursorPaginateParams,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  cursorPaginateAggregation,
  defaultPaginate,
  escapeRegExp,
  getPureDate,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IModels, IContext } from '~/connectionResolvers';
import { TR_STATUSES } from '@/accounting/@types/constants';
import { ITransactionDocument } from '@/accounting/@types/transaction';
import { generateFilter as accountGenerateFilter } from './accounts';
import { checkPermissionTrs } from '../../../utils/trPermissions';
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

  const accountFilter: any = await accountGenerateFilter(
    models,
    {
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
    },
    user,
  );

  const accounts = await models.Accounts.find(
    { ...accountFilter },
    { _id: 1 },
  ).lean();
  return accounts.map((a) => a._id);
};

// Returns the list of account IDs that the user is allowed to read.
async function getAllowedAccountIds(
  models: IModels,
  params: IQueryParams,
  user: IUserDocument,
  subdomain: string,
): Promise<string[]> {
  const accountIds = await getAccountIds(models, params, user);
  if (accountIds.length === 0) return [];

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

/**
 * Returns a MongoDB filter for the 'own' scope, and a flag indicating whether
 * level‑based scopes (ltLvl, lteLvl, gtLvl) require post‑filtering.
 */
async function buildReadPermissionFilter(
  models: IModels,
  userId: string,
  accountId: string,
): Promise<{ mongoFilter: any; needsPostFilter: boolean }> {
  const perm = await models.Permissions.findOne({ userId, accountId }).lean() as
    | { read: string; level?: number }
    | null;
  if (!perm || perm.read === 'none') {
    return { mongoFilter: { _id: null }, needsPostFilter: false }; // no access
  }
  if (perm.read === 'own') {
    return {
      mongoFilter: { $or: [{ createdBy: userId }, { modifiedBy: userId }] },
      needsPostFilter: false,
    };
  }
  // For level‑based scopes (ltLvl, lteLvl, gtLvl) we post‑filter in memory
  return { mongoFilter: {}, needsPostFilter: true };
}

const generateFilter = async (
  subdomain: string,
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
    journals,
    customerType,
    customerId,
    brandId,
    branchId,
    departmentId,
    currency,
    statuses,
    ptrStatus,
    status,
    createdUserId,
    modifiedUserId,
    startDate,
    endDate,
    startUpdatedDate,
    endUpdatedDate,
    startCreatedDate,
    endCreatedDate,
  } = params;
  const filter: any = {};

  if (createdUserId) {
    filter.createdBy = createdUserId;
  }

  if (modifiedUserId) {
    filter.modifiedBy = modifiedUserId;
  }

  const dateQry: any = {};
  if (startDate) {
    dateQry.$gte = getPureDate(startDate);
  }
  if (endDate) {
    dateQry.$lte = getPureDate(endDate);
  } 
  if (Object.keys(dateQry).length) {
    filter.date = dateQry;
  }

  const createdDateQry: any = {};
  if (startCreatedDate) {
    createdDateQry.$gte = getPureDate(startCreatedDate);
  }
  if (endCreatedDate) {
    createdDateQry.$lte = getPureDate(endCreatedDate);
  }
  if (Object.keys(createdDateQry).length) {
    filter.createdAt = createdDateQry;
  }

  const updatedDateQry: any = {};
  if (startUpdatedDate) {
    updatedDateQry.$gte = getPureDate(startUpdatedDate);
  }
  if (endUpdatedDate) {
    updatedDateQry.$lte = getPureDate(endUpdatedDate);
  }
  if (Object.keys(updatedDateQry).length) {
    filter.updatedAt = updatedDateQry;
  }

  // For multi‑account queries, we will replace the $in with allowed account IDs
  // after permission checks. So we temporarily set an empty $in.
  // The actual $in will be set in the resolver.
  filter['details.accountId'] = { $in: [] };

  if (journals?.length) {
    filter.journal = { $in: journals };
  }

  if (journal) {
    filter.journal = journal;
  }

  if (statuses?.length) {
    filter.status = { $in: statuses };
  } else {
    filter.status = { $in: TR_STATUSES.ACTIVE };
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
    filter.description = regex;
  }

  if (ptrStatus) {
    filter.ptrStatus = ptrStatus;
  }

  if (status) {
    filter.status = status;
  }

  if (brandId) {
    filter.scopeBrandIds = { $in: [brandId] };
  }

  if (branchId) {
    const branches = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'branches',
      action: 'findWithChild',
      input: {
        query: { _id: branchId },
        fields: { _id: 1 },
      },
      defaultValue: [],
    });

    filter.branchId = { $in: branches.map((item) => item._id) };
  }

  if (departmentId) {
    const departments = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'departments',
      action: 'findWithChild',
      input: {
        query: { _id: departmentId },
        fields: { _id: 1 },
      },
      defaultValue: [],
    });

    filter.departmentId = { $in: departments.map((item) => item._id) };
  }

  if (customerType) {
    filter.customerType = customerType;
  }
  if (customerId) {
    filter.customerId = customerId;
  }

  if (currency) {
    filter['details.currency'] = currency;
  }

  return filter;
};

const transactionCommon = {
  async accTransactions(
    _root,
    params: IQueryParams & { page: number; perPage: number },
    { models, user, subdomain }: IContext,
  ) {
    // 1. Determine which accounts the user may access
    const allowedAccountIds = await getAllowedAccountIds(models, params, user, subdomain);
    if (allowedAccountIds.length === 0) return { list: [], totalCount: 0 };

    // 2. For the very first account, get the user's permission to decide filtering strategy
    const accountId = allowedAccountIds[0];
    const { mongoFilter, needsPostFilter } = await buildReadPermissionFilter(
      models,
      user._id,
      accountId,
    );
    if (mongoFilter._id === null) return { list: [], totalCount: 0 };

    // 3. Build base filter and enforce account scope
    const baseFilter = await generateFilter(subdomain, models, params, user);
    baseFilter['details.accountId'] = { $in: allowedAccountIds };
    const combinedFilter = { ...baseFilter, ...mongoFilter };

    let results = await models.Transactions.find(combinedFilter).lean();

    // 4. Post‑filter for level‑based permissions (ltLvl, lteLvl, gtLvl)
    if (needsPostFilter) {
      const getUserLevel = makeGetUserLevel(subdomain);
      const perm = await models.Permissions.findOne({ userId: user._id, accountId }).lean();
      const allowedResults = [];
      for (const tr of results) {
        const targetUserId = tr.modifiedBy || tr.createdBy;
        if (!targetUserId) continue;
        const targetLevel = await getUserLevel(targetUserId);
        const actorLevel = perm?.level ?? 0;
        let ok = false;
        switch (perm?.read) {
          case 'ltLvl': ok = targetLevel < actorLevel; break;
          case 'lteLvl': ok = targetLevel <= actorLevel; break;
          case 'gtLvl': ok = targetLevel > actorLevel; break;
          default: ok = false;
        }
        const allowedResults: any[] = [];
      }
      results = allowedResults;
    }

    // 5. Paginate and sort
    const { sortField, sortDirection, page, perPage, ids, excludeIds } = params;
    const paginationArgs = { page, perPage };
    if (ids?.length && !excludeIds && ids.length > (paginationArgs.perPage || 20)) {
      paginationArgs.page = 1;
      paginationArgs.perPage = ids.length;
    }
    let sort: any = { date: 1 };
    if (sortField) sort = { [sortField]: sortDirection ?? 1 };
    results.sort((a, b) => (a[sortField || 'date'] > b[sortField || 'date'] ? 1 : -1));
    const start = (paginationArgs.page - 1) * paginationArgs.perPage;
    const end = start + paginationArgs.perPage;
    const paginated = results.slice(start, end);
    return paginated;
  },

  async accTransactionDetail(
    _root,
    params: { _id: string },
    { models, user, subdomain }: IContext,
  ) {
    const transaction = await models.Transactions.findOne({ _id: params._id }).lean();
    if (!transaction) throw new Error('Transaction not found');

    const accountId = (transaction as any).accountId || transaction.details?.[0]?.accountId;
    if (!accountId) throw new Error('Transaction has no associated account');

    const getUserLevel = makeGetUserLevel(subdomain);
    const { canRead } = await checkAccountingPermission(
      user._id,
      accountId,
      {
        createdBy: transaction.createdBy,
        modifiedBy: transaction.modifiedBy,
      },
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
    const allowedAccountIds = await getAllowedAccountIds(models, params, user, subdomain);
    if (allowedAccountIds.length === 0) return { list: [], totalCount: 0, pageInfo: { hasNextPage: false } };

    const accountId = allowedAccountIds[0];
    const { mongoFilter, needsPostFilter } = await buildReadPermissionFilter(
      models,
      user._id,
      accountId,
    );
    if (mongoFilter._id === null) return { list: [], totalCount: 0, pageInfo: { hasNextPage: false } };

    const baseFilter = await generateFilter(subdomain, models, params, user);
    baseFilter['details.accountId'] = { $in: allowedAccountIds };
    const combinedFilter = { ...baseFilter, ...mongoFilter };

    if (!needsPostFilter) {
      // Direct cursor pagination possible
      params.orderBy ??= { date: 1 };
      params.orderBy = { ...params.orderBy, ptrId: params.orderBy?.ptrId ?? 1 };
      return await cursorPaginate({
        model: models.Transactions,
        params,
        query: combinedFilter,
      });
    } else {
      // Post‑filter for level‑based scopes
      let results = await models.Transactions.find(combinedFilter).lean();
      const getUserLevel = makeGetUserLevel(subdomain);
      const perm = await models.Permissions.findOne({ userId: user._id, accountId }).lean();
      const allowed = [];
      for (const tr of results) {
        const targetUserId = tr.modifiedBy || tr.createdBy;
        if (!targetUserId) continue;
        const targetLevel = await getUserLevel(targetUserId);
        const actorLevel = perm?.level ?? 0;
        let ok = false;
        switch (perm?.read) {
          case 'ltLvl': ok = targetLevel < actorLevel; break;
          case 'lteLvl': ok = targetLevel <= actorLevel; break;
          case 'gtLvl': ok = targetLevel > actorLevel; break;
          default: ok = false;
        }
        const allowed: any[] = [];
      }
      // Manual "cursor" pagination: use limit/cursor (cursor is a number)
      const cursor = params.cursor ? parseInt(params.cursor) : 0;
      const limit = params.limit || 20;
      const paginated = allowed.slice(cursor, cursor + limit);
      const hasNextPage = allowed.length > cursor + limit;
      return {
        list: paginated,
        totalCount: allowed.length,
        pageInfo: { hasNextPage, endCursor: (cursor + limit).toString() },
      };
    }
  },

  async accTransactionsCount(
    _root,
    params: IQueryParams,
    { models, user, subdomain }: IContext,
  ) {
    const allowedAccountIds = await getAllowedAccountIds(models, params, user, subdomain);
    if (allowedAccountIds.length === 0) return 0;

    const accountId = allowedAccountIds[0];
    const { mongoFilter, needsPostFilter } = await buildReadPermissionFilter(
      models,
      user._id,
      accountId,
    );
    if (mongoFilter._id === null) return 0;

    const baseFilter = await generateFilter(subdomain, models, params, user);
    baseFilter['details.accountId'] = { $in: allowedAccountIds };
    const combinedFilter = { ...baseFilter, ...mongoFilter };

    if (!needsPostFilter) {
      return models.Transactions.find(combinedFilter).countDocuments();
    } else {
      // Count after post‑filtering
      let results = await models.Transactions.find(combinedFilter).lean();
      const getUserLevel = makeGetUserLevel(subdomain);
      const perm = await models.Permissions.findOne({ userId: user._id, accountId }).lean();
      let count = 0;
      for (const tr of results) {
        const targetUserId = tr.modifiedBy || tr.createdBy;
        if (!targetUserId) continue;
        const targetLevel = await getUserLevel(targetUserId);
        const actorLevel = perm?.level ?? 0;
        let ok = false;
        switch (perm?.read) {
          case 'ltLvl': ok = targetLevel < actorLevel; break;
          case 'lteLvl': ok = targetLevel <= actorLevel; break;
          case 'gtLvl': ok = targetLevel > actorLevel; break;
          default: ok = false;
        }
        if (ok) count++;
      }
      return count;
    }
  },

  async accTrRecordsMain(
    _root,
    params: IRecordsParams & ICursorPaginateParams,
    { models, user, subdomain }: IContext,
  ) {
    // Same pattern as accTransactionsMain, but using aggregation.
    // For brevity, we apply the same permission strategy.
    const allowedAccountIds = await getAllowedAccountIds(models, params, user, subdomain);
    if (allowedAccountIds.length === 0) return { list: [], totalCount: 0, pageInfo: { hasNextPage: false } };

    const accountId = allowedAccountIds[0];
    const { mongoFilter, needsPostFilter } = await buildReadPermissionFilter(
      models,
      user._id,
      accountId,
    );
    if (mongoFilter._id === null) return { list: [], totalCount: 0, pageInfo: { hasNextPage: false } };

    const baseFilter = await generateFilter(subdomain, models, params, user);
    baseFilter['details.accountId'] = { $in: allowedAccountIds };
    const combinedFilter = { ...baseFilter, ...mongoFilter };

    if (!needsPostFilter) {
      params.orderBy ??= { date: 1 };
      params.orderBy = { ...params.orderBy, ptrId: params.orderBy?.ptrId ?? 1, _id: 1 };
      return await cursorPaginateAggregation({
        model: models.Transactions,
        pipeline: [
          { $match: combinedFilter },
          { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [
                  '$$ROOT',
                  { _id: { $concat: ['$_id', '-', '$details._id'] } },
                  { trId: '$_id' },
                ],
              },
            },
          },
        ],
        params,
        formatter: { date: 'date', createAt: 'date' },
      });
    } else {
      // Post‑filter aggregation results
      let pipeline: any[] = [
        { $match: combinedFilter },
        { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                '$$ROOT',
                { _id: { $concat: ['$_id', '-', '$details._id'] } },
                { trId: '$_id' },
              ],
            },
          },
        },
      ];
      let results = await models.Transactions.aggregate(pipeline);
      const getUserLevel = makeGetUserLevel(subdomain);
      const perm = await models.Permissions.findOne({ userId: user._id, accountId }).lean();
      const allowed = [];
      for (const record of results) {
        const targetUserId = record.modifiedBy || record.createdBy;
        if (!targetUserId) continue;
        const targetLevel = await getUserLevel(targetUserId);
        const actorLevel = perm?.level ?? 0;
        let ok = false;
        switch (perm?.read) {
          case 'ltLvl': ok = targetLevel < actorLevel; break;
          case 'lteLvl': ok = targetLevel <= actorLevel; break;
          case 'gtLvl': ok = targetLevel > actorLevel; break;
          default: ok = false;
        }
        const allowed: any[] = [];
      }
      const cursor = params.cursor ? parseInt(params.cursor) : 0;
      const limit = params.limit || 20;
      const paginated = allowed.slice(cursor, cursor + limit);
      const hasNextPage = allowed.length > cursor + limit;
      return {
        list: paginated,
        totalCount: allowed.length,
        pageInfo: { hasNextPage, endCursor: (cursor + limit).toString() },
      };
    }
  },

  async accTrRecords(
    _root,
    params: IRecordsParams & { page: number; perPage: number },
    { models, user, subdomain }: IContext,
  ) {
    const allowedAccountIds = await getAllowedAccountIds(models, params, user, subdomain);
    if (allowedAccountIds.length === 0) return [];

    const accountId = allowedAccountIds[0];
    const { mongoFilter, needsPostFilter } = await buildReadPermissionFilter(
      models,
      user._id,
      accountId,
    );
    if (mongoFilter._id === null) return [];

    const baseFilter = await generateFilter(subdomain, models, params, user);
    baseFilter['details.accountId'] = { $in: allowedAccountIds };
    const combinedFilter = { ...baseFilter, ...mongoFilter };

    let pipeline: any[] = [
      { $match: combinedFilter },
      { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$$ROOT',
              { _id: { $concat: ['$_id', '-', '$details._id'] } },
              { trId: '$_id' },
            ],
          },
        },
      },
    ];

    if (!needsPostFilter) {
      const { sortField, sortDirection, page, perPage, ids, excludeIds } = params;
      const pageArgs = { page, perPage };
      if (ids?.length && !excludeIds && ids.length > (pageArgs.perPage || 20)) {
        pageArgs.page = 1;
        pageArgs.perPage = ids.length;
      }
      const $limit = Number(pageArgs.perPage || '20');
      const $skip = (Number(pageArgs.page || '1') - 1) * $limit;
      let $sort: any = { date: 1 };
      if (sortField) $sort = { [sortField]: sortDirection ?? 1 };
      pipeline.push({ $sort }, { $skip }, { $limit });
      return await models.Transactions.aggregate(pipeline);
    } else {
      let results = await models.Transactions.aggregate(pipeline);
      const getUserLevel = makeGetUserLevel(subdomain);
      const perm = await models.Permissions.findOne({ userId: user._id, accountId }).lean();
      const allowed = [];
      for (const record of results) {
        const targetUserId = record.modifiedBy || record.createdBy;
        if (!targetUserId) continue;
        const targetLevel = await getUserLevel(targetUserId);
        const actorLevel = perm?.level ?? 0;
        let ok = false;
        switch (perm?.read) {
          case 'ltLvl': ok = targetLevel < actorLevel; break;
          case 'lteLvl': ok = targetLevel <= actorLevel; break;
          case 'gtLvl': ok = targetLevel > actorLevel; break;
          default: ok = false;
        }
        const allowed: any[] = [];
      }
      const { sortField, sortDirection, page, perPage } = params;
      const pageArgs = { page: page || 1, perPage: perPage || 20 };
      const $limit = Number(pageArgs.perPage || '20');
      const $skip = (Number(pageArgs.page || '1') - 1) * $limit;
      allowed.sort((a, b) => (a[sortField || 'date'] > b[sortField || 'date'] ? 1 : -1));
      const paginated = allowed.slice($skip, $skip + $limit);
      return paginated;
    }
  },

  async accTrRecordsCount(
    _root,
    params: IRecordsParams,
    { models, subdomain, user }: IContext,
  ) {
    const allowedAccountIds = await getAllowedAccountIds(models, params, user, subdomain);
    if (allowedAccountIds.length === 0) return 0;

    const accountId = allowedAccountIds[0];
    const { mongoFilter, needsPostFilter } = await buildReadPermissionFilter(
      models,
      user._id,
      accountId,
    );
    if (mongoFilter._id === null) return 0;

    const baseFilter = await generateFilter(subdomain, models, params, user);
    baseFilter['details.accountId'] = { $in: allowedAccountIds };
    const combinedFilter = { ...baseFilter, ...mongoFilter };

    if (!needsPostFilter) {
      return await models.Transactions.aggregate([
        { $match: combinedFilter },
        { $unwind: '$details' },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]).then(res => res[0]?.count ?? 0);
    } else {
      let results = await models.Transactions.aggregate([
        { $match: combinedFilter },
        { $unwind: '$details' },
        { $replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', { trId: '$_id' }] } } },
      ]);
      const getUserLevel = makeGetUserLevel(subdomain);
      const perm = await models.Permissions.findOne({ userId: user._id, accountId }).lean();
      let count = 0;
      for (const record of results) {
        const targetUserId = record.modifiedBy || record.createdBy;
        if (!targetUserId) continue;
        const targetLevel = await getUserLevel(targetUserId);
        const actorLevel = perm?.level ?? 0;
        let ok = false;
        switch (perm?.read) {
          case 'ltLvl': ok = targetLevel < actorLevel; break;
          case 'lteLvl': ok = targetLevel <= actorLevel; break;
          case 'gtLvl': ok = targetLevel > actorLevel; break;
          default: ok = false;
        }
        if (ok) count++;
      }
      return count;
    }
  },
};

export default transactionCommon;