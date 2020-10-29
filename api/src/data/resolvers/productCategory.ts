import { Products } from '../../db/models';
import { IProductCategoryDocument } from '../../db/models/definitions/deals';

export default {
  isRoot(category: IProductCategoryDocument, {}) {
    return category.parentId ? false : true;
  },

  async productCount(category: IProductCategoryDocument, {}) {
    return Products.countDocuments({ categoryId: category._id });
  }
};
