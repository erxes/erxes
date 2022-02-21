import { ProductCategories, Products } from '../../db/models';
import { PRODUCT_STATUSES } from '../../db/models/definitions/constants';
import { IProductCategoryDocument } from '../../db/models/definitions/deals';

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
