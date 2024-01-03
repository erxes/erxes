import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';
import { IProductDocument } from '../../models/definitions/products';
import { customFieldsDataByFieldCode } from '@erxes/api-utils/src/fieldUtils';

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

  customFieldsDataByFieldCode(
    product: IProductDocument,
    _,
    { subdomain }: IContext
  ) {
    return customFieldsDataByFieldCode(product, subdomain, sendCommonMessage);
  }
};
