import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';

import { escapeRegExp } from '@erxes/api-utils/src/core';
import { IContext, IModels } from '../../../connectionResolver';

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
  isOutBalance?: boolean,
  branchId: string;
  departmentId: string;
  currency: string;
  journal: string;
}

const generateFilter = async (
  models,
  commonQuerySelector,
  params,
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
  } = params;
  const filter: any = commonQuerySelector;

  filter.status = { $ne: ACCOUNT_STATUSES.DELETED };

  if (params.status) {
    filter.status = params.status;
  }
  if (type) {
    filter.type = type;
  }

  if (categoryId) {
    const category = await models.AccountCategories.getAccountingCategory({
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

    filter.categoryId = { $nin: notActiveCategories.map((e) => e._id) };
  }

  if (ids && ids.length > 0) {
    filter._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  // search =========
  if (searchValue) {
    const regex = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');
    const codeRegex = new RegExp(
      `^${searchValue
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.')
        .replace(/_/g, '.')}.*`,
      'igu',
    );

    filter.$or = [
      {
        $or: [{ code: { $in: [regex] } }, { code: { $in: [codeRegex] } }],
      },
      { name: { $in: [regex] } },
      { barcodes: { $in: [searchValue] } },
    ];
  }

  if (currency) {
    filter.currency = currency;
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
      models.Accounts.find(filter).sort(sort).lean(),
      pagintationArgs,
    )
  },

  async accountsTotalCount(
    _root,
    params: IQueryParams,
    { commonQuerySelector, models }: IContext,
  ) {
    const filter = await generateFilter(
      models,
      commonQuerySelector,
      params,
    );

    return models.Accounts.find(filter).count();
  },

  accountDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Accounts.findOne({ _id }).lean();
  },
};

requireLogin(accountQueries, 'accountsTotalCount');
checkPermission(accountQueries, 'accounts', 'showAccounts', []);

export default accountQueries;
