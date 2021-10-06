import { IProductDocument } from '../../db/models/definitions/deals';
import { IContext } from '../types';

export default {
  category(product: IProductDocument, _, { dataLoaders }: IContext) {
    if (product.categoryId) {
      return dataLoaders.productCategory.load(product.categoryId);
    }
  },

  getTags(product: IProductDocument, _, { dataLoaders }: IContext) {
    return dataLoaders.tag.loadMany(product.tagIds || []);
  },

  vendor(product: IProductDocument, _, { dataLoaders }: IContext) {
    if (product.vendorId) {
      return dataLoaders.company.load(product.vendorId);
    }
  }
};
