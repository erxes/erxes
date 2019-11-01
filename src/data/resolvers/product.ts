import { ProductCategories, Tags } from '../../db/models';
import { IProductDocument } from '../../db/models/definitions/deals';

export default {
  category(product: IProductDocument) {
    return ProductCategories.findOne({ _id: product.categoryId });
  },

  getTags(product: IProductDocument) {
    return Tags.find({ _id: { $in: product.tagIds || [] } });
  },
};
