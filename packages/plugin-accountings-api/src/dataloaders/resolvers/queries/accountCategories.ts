import {
  checkPermission,
} from '@erxes/api-utils/src/permissions';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { IContext, IModels } from '../../../connectionResolver';

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

const accountCategoryQueries = {
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

  async accountCategoryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.AccountCategories.findOne({ _id }).lean();
  },
};

checkPermission(accountCategoryQueries, 'accountCategories', 'showAccounts', []);

export default accountCategoryQueries;
