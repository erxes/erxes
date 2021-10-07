import { IProductDocument } from '../../db/models/definitions/deals';
import { IContext } from '../types';

export default {
  category(product: IProductDocument, _, { dataLoaders }: IContext) {
    return (
      (product.categoryId &&
        dataLoaders.productCategory.load(product.categoryId)) ||
      null
    );
  },

  getTags(product: IProductDocument, _, { dataLoaders }: IContext) {
    return dataLoaders.tag.loadMany(product.tagIds || []);
  },

  vendor(product: IProductDocument, _, { dataLoaders }: IContext) {
    return (
      (product.vendorId && dataLoaders.company.load(product.vendorId)) || null
    );
  }
};
