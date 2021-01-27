import { Products } from '../../db/models';
import { PRODUCT_STATUSES } from '../../db/models/definitions/constants';
import { IProductCategoryDocument } from '../../db/models/definitions/deals';

export default {
  isRoot(category: IProductCategoryDocument, {}) {
    return category.parentId ? false : true;
  },

  async productCount(category: IProductCategoryDocument, {}) {
    return Products.countDocuments({ categoryId: category._id, status: {$ne: PRODUCT_STATUSES.DELETED} });
  }
};
