import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { afterQueryWrapper, paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { IContext, IModels } from '../../../connectionResolver';
import { ACCOUNT_STATUSES } from '../../../models/definitions/constants';

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
}

const generateFilter = async (
  subdomain,
  models,
  commonQuerySelector,
  params,
) => {
  const {
    type,
    categoryId,
    searchValue,
    vendorId,
    brand,
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

  if (vendorId) {
    filter.vendorId = vendorId;
  }

  if (brand) {
    filter.scopeBrandIds = { $in: [brand] };
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
    { commonQuerySelector, models, subdomain, user }: IContext,
  ) {
    const filter = await generateFilter(
      subdomain,
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

    return afterQueryWrapper(
      subdomain,
      'accounts',
      params,
      await paginate(
        models.Accounts.find(filter).sort(sort).lean(),
        pagintationArgs,
      ),
      user,
    );
  },

  async accountsTotalCount(
    _root,
    params: IQueryParams,
    { commonQuerySelector, models, subdomain }: IContext,
  ) {
    const filter = await generateFilter(
      subdomain,
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
