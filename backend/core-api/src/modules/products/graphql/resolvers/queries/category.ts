import { escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';

import { IProductCategoryParams } from '@/products/@types';
import { Resolver } from 'erxes-api-shared/core-types';

const generateFilter = async (
  models: IModels,
  {
    parentId,
    withChild,
    searchValue,
    meta,
    brandIds,
    status,
    ids,
  }: IProductCategoryParams,
) => {
  const filter: FilterQuery<IProductCategoryParams> = {};

  filter.status = { $nin: ['disabled', 'archived'] };

  if (status && status !== 'active') {
    filter.status = status;
  }

  if (parentId) {
    if (withChild) {
      const category = await models.ProductCategories.getProductCategory({
        _id: parentId,
      });

      const relatedCategoryIds = (
        await models.ProductCategories.find(
          { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
          { _id: 1 },
        ).lean()
      ).map((c) => c._id);

      filter.parentId = { $in: relatedCategoryIds };
    } else {
      filter.parentId = parentId;
    }
  }

  if (brandIds) {
    filter.scopeBrandIds = { $in: brandIds };
  }

  if (meta) {
    if (typeof meta === 'number' && !isNaN(meta)) {
      filter.meta = { $lte: Number(meta) };
    } else {
      filter.meta = meta;
    }
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (ids?.length > 0) {
    filter._id = { $in: ids };
  }

  return filter;
};

export const categoryQueries: Record<string, Resolver<any, any, IContext>> = {
  async productCategories(
    _parent: undefined,
    params: IProductCategoryParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(models, params);
    const sortParams: any = { order: 1 };
    return await models.ProductCategories.find(filter).sort(sortParams).lean();
  },

  async cpProductCategories(
    _parent: undefined,
    params: IProductCategoryParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(models, params);
    const sortParams: any = { order: 1 };
    return await models.ProductCategories.find(filter).sort(sortParams).lean();
  },

  async productCategoriesTotalCount(
    _parent: undefined,
    params: IProductCategoryParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(models, params);
    return models.ProductCategories.countDocuments(filter);
  },

  async productCategoryDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.ProductCategories.findOne({ _id }).lean();
  },

  async categoriesWithChilds(
    _parent: undefined,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) {
    return await models.ProductCategories.getChildCategories(ids);
  },
};

categoryQueries.cpProductCategories.wrapperConfig = {
  forClientPortal: true,
};
