import { escapeRegExp } from "@erxes/api-utils/src/core";
import { IContext } from "../../connectionResolver";
import {
  IProductCategoryDocument,
  PRODUCT_STATUSES
} from "../../db/models/definitions/products";

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.ProductCategories.findOne({ _id });
  },

  isRoot(category: IProductCategoryDocument, {}) {
    return category.parentId ? false : true;
  },

  async productCount(
    category: IProductCategoryDocument,
    {},
    { models }: IContext
  ) {
    const product_category_ids = await models.ProductCategories.find(
      { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
      { _id: 1 }
    );
    return models.Products.countDocuments({
      categoryId: { $in: product_category_ids },
      status: { $ne: PRODUCT_STATUSES.DELETED }
    });
  }
};
