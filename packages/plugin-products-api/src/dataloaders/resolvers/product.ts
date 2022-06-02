import { IContext } from '../../connectionResolver';
import { IProductDocument } from '../../models/definitions/products';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Products.findOne({ _id });
  },

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
  },

  async uom(product: IProductDocument, _, { dataLoaders, models }: IContext) {
    if (!(await models.ProductsConfigs.getConfig('isReqiureUOM', ''))) {
      return {};
    }

    let uomId = product.uomId;
    if (!uomId) {
      uomId = await models.ProductsConfigs.getConfig('default_uom', '');
    }

    if (!uomId) {
      return {};
    }

    return models.Uoms.getUom({ _id: uomId });
  }
};
