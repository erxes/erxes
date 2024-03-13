import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { afterQueryWrapper, paginate } from '@erxes/api-utils/src';
import { ACCOUNT_STATUSES } from '../../../models/definitions/accounts';
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

const generateFilterCat = async ({
  models,
  parentId,
  withChild,
  searchValue,
  brand,
  status,
}) => {
  const filter: any = {};
  filter.status = { $nin: ['disabled', 'archived'] };

  if (status && status !== 'active') {
    filter.status = status;
  }

  if (parentId) {
    if (withChild) {
      const category = await (
        models as IModels
      ).AccountCategories.getAccountCategory({
        _id: parentId,
      });

      const relatedCategoryIds = (
        await models.AccountCategories.find(
          { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
          { _id: 1 },
        ).lean()
      ).map((c) => c._id);

      filter.parentId = { $in: relatedCategoryIds };
    } else {
      filter.parentId = parentId;
    }
  }

  if (brand) {
    filter.scopeBrandIds = { $in: [brand] };
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
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

  async accountCategories(
    _root,
    { parentId, withChild, searchValue, status, brand, meta },
    { models }: IContext,
  ) {
    const filter = await generateFilterCat({
      models,
      status,
      parentId,
      withChild,
      searchValue,
      brand,
    });

    const sortParams: any = { order: 1 };

    return await models.AccountCategories.find(filter).sort(sortParams).lean();
  },

  async accountCategoriesTotalCount(
    _root,
    { parentId, searchValue, status, withChild, brand, meta },
    { models }: IContext,
  ) {
    const filter = await generateFilterCat({
      models,
      parentId,
      withChild,
      searchValue,
      status,
      brand,
    });
    return models.AccountCategories.find(filter).countDocuments();
  },

  accountDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Accounts.findOne({ _id }).lean();
  },

  accountCategoryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.AccountCategories.findOne({ _id }).lean();
  },
};

requireLogin(accountQueries, 'accountsTotalCount');
checkPermission(accountQueries, 'accounts', 'showAccounts', []);
checkPermission(accountQueries, 'accountCategories', 'showAccounts', []);

export default accountQueries;
