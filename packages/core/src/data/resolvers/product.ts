import { IContext } from "../../connectionResolver";
import { IProductDocument } from "../../db/models/definitions/products";
import { customFieldsDataByFieldCode } from "@erxes/api-utils/src/fieldUtils";

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Products.findOne({ _id });
  },

  async category(product: IProductDocument, _, { dataLoaders }: IContext) {
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

  async customFieldsDataByFieldCode(
    product: IProductDocument,
    _,
    { subdomain }: IContext
  ) {
    return customFieldsDataByFieldCode(product, subdomain);
  }
};
