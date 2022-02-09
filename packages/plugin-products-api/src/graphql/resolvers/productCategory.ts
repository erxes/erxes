import { ProductCategories, Products } from "../../models";
import { IProductCategoryDocument, PRODUCT_STATUSES } from "../../models/definitions/products";

export default {
  isRoot(category: IProductCategoryDocument, {}) {
    return category.parentId ? false : true;
  },

  async productCount(category: IProductCategoryDocument, {}) {
    const product_category_ids = await ProductCategories.find(
      { order: { $regex: new RegExp(category.order) } },
      { _id: 1 }
    );

    return Products.countDocuments({
      categoryId: { $in: product_category_ids },
      status: { $ne: PRODUCT_STATUSES.DELETED }
    });
  }
};