import { ProductCategories, Products } from '../../db/models';
import { PRODUCT_STATUSES } from '../../db/models/definitions/constants';

export default {
  async count(bookingTree: any) {
    if (bookingTree.type === 'category') {
      const productCategory = await ProductCategories.getProductCatogery({
        _id: bookingTree._id
      });

      const product_category_ids = await ProductCategories.find(
        { order: { $regex: new RegExp(productCategory.order) } },
        { _id: 1 }
      );

      return Products.countDocuments({
        categoryId: { $in: product_category_ids },
        status: { $ne: PRODUCT_STATUSES.DELETED }
      });
    }

    return 1;
  }
};
