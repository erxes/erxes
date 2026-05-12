import { ACCOUNT_STATUSES } from '@/accounting/@types/constants';
import {
  ICursorPaginateParams,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  escapeRegExp,
} from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';

interface IQueryParams {
  ids?: string[];
  excludeIds?: boolean;
  status?: string;
  categoryId?: string;
  searchValue?: string;
  brand?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  isTemp?: boolean;
  isOutBalance?: boolean;
  branchId?: string;
  departmentId?: string;
  currency?: string;
  journal?: string;
  journals?: string[];
  kind?: string;
  code?: string;
  name?: string;
  userId?: string;
  minLvl?: number;
  maxLvl?: number;
  readPerm?: string;
  writePerm?: string;
}

export const generateFilter = async (
  models: IModels,
  params: IQueryParams,
  user: IUserDocument,
) => {
  const {
    categoryId,
    searchValue,
    brand,
    isTemp,
    isOutBalance,
    branchId,
    departmentId,
    currency,
    journal,
    ids,
    excludeIds,
    journals,
    kind,
    code,
    name,
  } = params;
  const filter: any = {};

  filter.status = { $ne: ACCOUNT_STATUSES.DELETED };

  if (ids?.length) {
    filter._id = { [excludeIds ? '$nin' : '$in']: ids };
  }
  if (params.status) {
    filter.status = params.status;
  }

  if (categoryId) {
    const category = await models.AccountCategories.getAccountCategory({
      _id: categoryId,
      status: { $in: [null, 'active'] },
    });
    const accountCategoryIds = await models.AccountCategories.find(
      { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
      { _id: 1 },
    );
    filter.categoryId = { $in: accountCategoryIds };
  } else {
    const notActiveCategories = await models.AccountCategories.find({
      status: { $nin: [null, 'active'] },
    });
    if (notActiveCategories.length) {
      filter.categoryId = { $nin: notActiveCategories.map((e) => e._id) };
    }
  }

  if (kind) {
    filter.kind = kind;
  }

  if (searchValue) {
    const regex = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');
    let codeFilter = { code: { $in: [regex] } };
    if (
      searchValue.includes('.') ||
      searchValue.includes('_') ||
      searchValue.includes('*')
    ) {
      const codeRegex = new RegExp(
        `^${searchValue.replace(/\*/g, '.').replace(/_/g, '.')}$`,
        'igu',
      );
      codeFilter = { code: { $in: [codeRegex] } };
    }
    filter.$or = [codeFilter, { name: { $in: [regex] } }];
  }

  if (code) {
    filter.code = new RegExp(
      `${code.replace(/\*/g, '.').replace(/_/g, '.')}`,
      'igu',
    );
  }
  if (name) {
    filter.name = new RegExp(`.*${escapeRegExp(name)}.*`, 'i');
  }

  if (currency) {
    filter.currency = currency;
  }
  if (journals?.length) {
    filter.journal = { $in: journals };
  }
  if (journal) {
    filter.journal = journal;
  }
  if (branchId) {
    filter.branchId = branchId;
  }
  if (departmentId) {
    filter.departmentId = departmentId;
  }
  if (brand) {
    filter.scopeBrandIds = { $in: [brand] };
  }
  if (isTemp !== undefined) {
    filter.isTemp = isTemp;
  }
  if (isOutBalance !== undefined) {
    filter.isOutBalance = isOutBalance;
  }
  if (user?.isOwner) {
    return filter;
  }

  return filter;
};

/**
 * Applies permission filters in-memory to a list of accounts.
 * Returns a new filtered array.
 */
async function applyPermissionFilters(
  accounts: any[],
  models: IModels,
  params: {
    userId?: string;
    minLvl?: number;
    maxLvl?: number;
    readPerm?: string;
    writePerm?: string;
  },
) {
  const { userId, minLvl, maxLvl, readPerm, writePerm } = params;
  if (!userId) return accounts;

  const perms = await models.Permissions.find({ userId }).lean();
  const permMap = new Map(perms.map(p => [p.accountId, p]));

  return accounts.filter(acc => {
    const p = permMap.get(acc._id) || { level: 0, read: 'none', write: 'none' };
    if (minLvl !== undefined && p.level < minLvl) return false;
    if (maxLvl !== undefined && p.level > maxLvl) return false;
    if (readPerm && p.read !== readPerm) return false;
    if (writePerm && p.write !== writePerm) return false;
    return true;
  });
}

const accountQueries = {
  /**
   * Accounts list (cursor pagination) – does not apply permission filters.
   */
  async accountsMain(
    _root,
    params: IQueryParams & ICursorPaginateParams,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('accountsRead');
    const { userId, minLvl, maxLvl, readPerm, writePerm, ...baseParams } = params;
    const filter = await generateFilter(models, baseParams, user);
    params.orderBy ??= { code: 1 };
    return await cursorPaginate({
      model: models.Accounts,
      params,
      query: filter,
    });
  },

  /**
   * Accounts list (standard pagination) – supports permission filters.
   */
  async accounts(_root, params: IQueryParams, { models, user, checkPermission }: IContext) {
    await checkPermission('accountsRead');

    const { userId, minLvl, maxLvl, readPerm, writePerm, ...baseParams } = params;
    const filter = await generateFilter(models, baseParams, user);
    let accounts = await models.Accounts.find(filter).lean();

    accounts = await applyPermissionFilters(accounts, models, {
      userId, minLvl, maxLvl, readPerm, writePerm,
    });

    // In-memory sorting & pagination
    const { sortField, sortDirection, page, perPage, ids, excludeIds } = baseParams;
    const paginationArgs = { page: page || 1, perPage: perPage || 20 };
    if (!excludeIds && ids?.length && ids.length > paginationArgs.perPage) {
      paginationArgs.page = 1;
      paginationArgs.perPage = ids.length;
    }

    const sortFn = (a: any, b: any) => {
      const aVal = a[sortField || 'code'];
      const bVal = b[sortField || 'code'];
      if (aVal === bVal) return 0;
      const direction = sortDirection === -1 ? -1 : 1;
      return (aVal < bVal ? -1 : 1) * direction;
    };
    accounts.sort(sortFn);

    const start = (paginationArgs.page - 1) * paginationArgs.perPage;
    return accounts.slice(start, start + paginationArgs.perPage);
  },

  /**
   * Accounts count – also supports permission filters.
   */
  async accountsCount(_root, params: IQueryParams, { models, user, checkPermission }: IContext) {
    await checkPermission('accountsRead');

    const { userId, minLvl, maxLvl, readPerm, writePerm, ...baseParams } = params;
    const filter = await generateFilter(models, baseParams, user);
    let accounts = await models.Accounts.find(filter).lean();

    accounts = await applyPermissionFilters(accounts, models, {
      userId, minLvl, maxLvl, readPerm, writePerm,
    });

    return accounts.length;
  },

  async accountDetail(_root, { _id }: { _id: string }, { models, checkPermission }: IContext) {
    await checkPermission('accountsRead');
    return models.Accounts.findOne({ _id }).lean();
  },
};

export default accountQueries;