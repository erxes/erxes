import { ProductCategories } from '../../db/models';
import { IProductDocument } from '../../db/models/definitions/deals';

export default {
  category(product: IProductDocument, {}) {
    return ProductCategories.findOne({ _id: product.categoryId });
  },
};
