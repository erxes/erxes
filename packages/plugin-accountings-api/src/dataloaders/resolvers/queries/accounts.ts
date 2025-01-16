import * as _ from 'lodash';
import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { IContext, IModels } from '../../../connectionResolver';
import { ACCOUNT_STATUSES } from '../../../models/definitions/constants';
import { IUserDocument } from '@erxes/api-utils/src/types';

interface IQueryParams {
  type: string;
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
  isOutBalance?: boolean,
  branchId?: string;
  departmentId?: string;
  currency?: string;
  journal?: string;
  journals?: string[];
  kind?: string;
  code?: string;
  name?: string;
}

export const generateFilter = async (
  models: IModels,
  commonQuerySelector: any,
  params: IQueryParams,
  user: IUserDocument
) => {
  const {
    type,
    categoryId,
    searchValue,
    brand,
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
  const filter: any = commonQuerySelector;

  filter.status = { $ne: ACCOUNT_STATUSES.DELETED };

  if (ids?.length) {
    filter._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  if (params.status) {
    filter.status = params.status;
  }
  if (type) {
    filter.type = type;
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
    if (searchValue.includes('.') || searchValue.includes('_') || searchValue.includes('*')) {
      const codeRegex = new RegExp(
        `^${searchValue.replace(/\*/g, '.').replace(/_/g, '.')}$`,
        'igu',
      );
      codeFilter = { code: { $in: [codeRegex] }, };
    }

    filter.$or = [
      codeFilter,
      { name: { $in: [regex] } },
    ];
  }

  if (code) {
    filter.code = code
  }

  if (name) {
    filter.name = name
  }

  if (currency) {
    filter.currency = currency;
  }

  if (journals?.length) {
    filter.journal = { $in: journals }
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

  if (isOutBalance !== undefined) {
    filter.isOutBalance = isOutBalance
  }

  if (user.isOwner) {
    return filter;
  }

  // const permissions = await models.Permissions.find({ user: user._id }).lean();

  // const hasPermAccountIds = permissions.map(p => p.accountId)

  // if (filter._id?.$in?.length) {
  //   filter._id.$in = _.intersection(filter._id.$in, hasPermAccountIds);
  //   return filter;
  // }

  // if (filter._id?.$nin?.length) {
  //   filter._id.$nin = _.difference(filter._id.$nin, hasPermAccountIds);
  //   return filter;
  // }

  // filter._id = { $in: hasPermAccountIds };

  return filter;
};

const accountQueries = {
  /**
   * Accounts list
   */
  async accounts(
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

    return await paginate(
      models.Accounts.find(filter).sort(sort).lean(),
      pagintationArgs,
    )
  },

  async accountsCount(
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

    return models.Accounts.find(filter).countDocuments();
  },

  async accountDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Accounts.findOne({ _id }).lean();
  },
};

requireLogin(accountQueries, 'accountsCount');
checkPermission(accountQueries, 'accounts', 'showAccounts', []);

export default accountQueries;
