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

  async getTags(product: IProductDocument, _, { dataLoaders }: IContext) {
    const tags = await dataLoaders.tag.loadMany(product.tagIds || []);
    return tags.filter(tag => tag);
  },

  vendor(product: IProductDocument, _, { dataLoaders }: IContext) {
    return (
      (product.vendorId && dataLoaders.company.load(product.vendorId)) || null
    );
  }
};
