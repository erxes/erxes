import { escapeRegExp } from 'erxes-api-shared/utils';
import { IProductCategoryDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

import { PRODUCT_STATUSES } from '@/products/constants';

export default {
  __resolveReference: async (
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.ProductCategories.findOne({ _id });
  },
  isRoot: (category: IProductCategoryDocument) => {
    return category.parentId ? false : true;
  },
  productCount: async (
    category: IProductCategoryDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    const product_category_ids = await models.ProductCategories.find(
      { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
      { _id: 1 },
    );
    return models.Products.countDocuments({
      categoryId: { $in: product_category_ids },
      status: { $ne: PRODUCT_STATUSES.DELETED },
    });
  },
};
