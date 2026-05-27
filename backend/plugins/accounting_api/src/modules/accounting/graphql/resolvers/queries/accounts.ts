import { ACCOUNT_STATUSES } from '@/accounting/@types/constants';
import {
  ACCOUNT_PERMISSION_SCOPES,
  ACCOUNT_PERMISSION_WRITE_SCOPES,
} from '@/accounting/@types/permission';
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

export interface IAccountQueryParams {
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
  permissionMode?: 'read' | 'write';
}

const getConfigUserIds = (config: any) => {
  if (Array.isArray(config?.value)) {
    return config.value;
  }

  return config?.value?.userIds || [];
};

const applyAccountPermissionFilter = async (
  models: IModels,
  filter: any,
  userId: string,
  permissionMode?: 'read' | 'write',
) => {
  if (!permissionMode) {
    return filter;
  }

  if (!['read', 'write'].includes(permissionMode)) {
    throw new Error(`Invalid account permission mode: ${permissionMode}`);
  }

  const dominantConfigCodes =
    permissionMode === 'write'
      ? ['dominantWriteAccountUsers']
      : ['dominantReadAccountUsers', 'dominantWriteAccountUsers'];

  const dominantConfigs = await models.Configs.find({
    code: { $in: dominantConfigCodes },
    subId: '',
  }).lean();

  if (
    dominantConfigs.some((config) => getConfigUserIds(config).includes(userId))
  ) {
    return filter;
  }

  const permissionFilter: any = {
    userId,
  };

  if (permissionMode === 'write') {
    permissionFilter.write = { $ne: ACCOUNT_PERMISSION_WRITE_SCOPES.NONE };
  } else {
    permissionFilter.$or = [
      { read: { $ne: ACCOUNT_PERMISSION_SCOPES.NONE } },
      { write: { $ne: ACCOUNT_PERMISSION_WRITE_SCOPES.NONE } },
    ];
  }

  const permissions = await models.Permissions.find(permissionFilter)
    .select({ accountId: 1 })
    .lean();
  const permittedAccountIds = permissions.map(
    (permission) => permission.accountId,
  );

  if (filter._id?.$in?.length) {
    const permittedAccountIdsSet = new Set(permittedAccountIds);
    filter._id.$in = filter._id.$in.filter((accountId: string) =>
      permittedAccountIdsSet.has(accountId),
    );
    return filter;
  }

  if (filter._id?.$nin?.length) {
    const excludedAccountIdsSet = new Set(filter._id.$nin);
    filter._id = {
      $in: permittedAccountIds.filter(
        (accountId) => !excludedAccountIdsSet.has(accountId),
      ),
    };
    return filter;
  }

  filter._id = { $in: permittedAccountIds };

  return filter;
};

export const generateFilter = async (
  models: IModels,
  params: IAccountQueryParams,
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
    permissionMode,
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

  return applyAccountPermissionFilter(models, filter, user._id, permissionMode);
};

const accountQueries = {
  /**
   * Accounts list
   */
  async accountsMain(
    _root,
    params: IAccountQueryParams & ICursorPaginateParams,
    { models, user, commonQuerySelector, checkPermission }: IContext,
  ) {
    await checkPermission('accountsRead');
    const filter = await generateFilter(models, params, user);

    params.orderBy ??= { code: 1 };

    return await cursorPaginate({
      model: models.Accounts,
      params,
      query: filter,
    });
  },

  async accounts(
    _root,
    params: IAccountQueryParams,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('accountsRead');
    const filter = await generateFilter(models, params, user);

    const { sortField, sortDirection, page, perPage, ids, excludeIds } = params;

    const pagintationArgs = { page, perPage };
    if (
      !excludeIds &&
      ids?.length &&
      ids?.length > (pagintationArgs.perPage || 20)
    ) {
      pagintationArgs.page = 1;
      pagintationArgs.perPage = ids.length;
    }

    let sort: any = { code: 1 };
    if (sortField) {
      sort = { [sortField]: sortDirection ?? 1 };
    }

    return await defaultPaginate(
      models.Accounts.find(filter).sort(sort).lean(),
      pagintationArgs,
    );
  },

  async accountsCount(
    _root,
    params: IAccountQueryParams,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('accountsRead');
    const filter = await generateFilter(models, params, user);

    return models.Accounts.find(filter).countDocuments();
  },

  async accountDetail(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('accountsRead');
    return models.Accounts.findOne({ _id }).lean();
  },
};

export default accountQueries;
