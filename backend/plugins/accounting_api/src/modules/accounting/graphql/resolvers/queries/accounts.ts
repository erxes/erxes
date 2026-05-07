import { ACCOUNT_STATUSES } from '@/accounting/@types/constants';
import {
  ICursorPaginateParams,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  defaultPaginate,
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

  // search =========
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

  // The original commented code for permissions is replaced by the new filtering logic
  // in the accounts resolver itself (we filter after fetch)
  return filter;
};

const accountQueries = {
  /**
   * Accounts list (cursor pagination) – we do NOT apply permission filters here for simplicity
   * (can be added later if needed)
   */
  async accountsMain(
    _root,
    params: IQueryParams & ICursorPaginateParams,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('accountsRead');
    // Remove permission filters before generating filter
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
   * Accounts list (standard pagination) – supports permission filters
   */
  async accounts(_root, params: IQueryParams, { models, user, checkPermission }: IContext) {
    await checkPermission('accountsRead');

    // Separate permission filters from base filters
    const { userId, minLvl, maxLvl, readPerm, writePerm, ...baseParams } = params;

    // Generate base filter (all existing filters except permission ones)
    const filter = await generateFilter(models, baseParams, user);
    let accounts = await models.Accounts.find(filter).lean();

    // Apply permission filters if userId is provided
    if (userId) {
      const perms = await models.Permissions.find({ userId }).lean();
      const permMap = new Map(perms.map(p => [p.accountId, p]));

      accounts = accounts.filter(acc => {
        const p = permMap.get(acc._id) || { level: 0, read: 'none', write: 'none' };
        if (minLvl !== undefined && p.level < minLvl) return false;
        if (maxLvl !== undefined && p.level > maxLvl) return false;
        if (readPerm && p.read !== readPerm) return false;
        if (writePerm && p.write !== writePerm) return false;
        return true;
      });
    }

    // Pagination and sorting (in‑memory because we filtered)
    const { sortField, sortDirection, page, perPage, ids, excludeIds } = baseParams;
    const paginationArgs = { page: page || 1, perPage: perPage || 20 };
    if (!excludeIds && ids?.length && ids.length > (paginationArgs.perPage)) {
      paginationArgs.page = 1;
      paginationArgs.perPage = ids.length;
    }

    let sortFn: (a: any, b: any) => number = (a, b) => {
      const aVal = a[sortField || 'code'];
      const bVal = b[sortField || 'code'];
      if (aVal === bVal) return 0;
      const direction = sortDirection === -1 ? -1 : 1;
      return (aVal < bVal ? -1 : 1) * direction;
    };
    accounts.sort(sortFn);

    const start = (paginationArgs.page - 1) * paginationArgs.perPage;
    const end = start + paginationArgs.perPage;
    const paginated = accounts.slice(start, end);
    return paginated;
  },

  /**
   * Accounts count – also supports permission filters
   */
  async accountsCount(_root, params: IQueryParams, { models, user, checkPermission }: IContext) {
    await checkPermission('accountsRead');

    const { userId, minLvl, maxLvl, readPerm, writePerm, ...baseParams } = params;
    const filter = await generateFilter(models, baseParams, user);
    let accounts = await models.Accounts.find(filter).lean();

    if (userId) {
      const perms = await models.Permissions.find({ userId }).lean();
      const permMap = new Map(perms.map(p => [p.accountId, p]));
      accounts = accounts.filter(acc => {
        const p = permMap.get(acc._id) || { level: 0, read: 'none', write: 'none' };
        if (minLvl !== undefined && p.level < minLvl) return false;
        if (maxLvl !== undefined && p.level > maxLvl) return false;
        if (readPerm && p.read !== readPerm) return false;
        if (writePerm && p.write !== writePerm) return false;
        return true;
      });
    }
    return accounts.length;
  },

  async accountDetail(_root, { _id }: { _id: string }, { models, checkPermission }: IContext) {
    await checkPermission('accountsRead');
    return models.Accounts.findOne({ _id }).lean();
  },
};

export default accountQueries;