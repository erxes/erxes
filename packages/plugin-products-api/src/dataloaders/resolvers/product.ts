import { IContext } from '../../connectionResolver';
import { IProductDocument } from '../../models/definitions/products';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Products.findOne({ _id });
  },

  category(product: IProductDocument, _, { dataLoaders }: IContext) {
    // console.log('heeeey111', product);
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
