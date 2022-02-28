import { Products } from '../../db/models';
import { IProductTemplateDocument } from '../../db/models/definitions/productTemplates';
import { IContext } from '../types';

export default {
  async tags(
    productTemplate: IProductTemplateDocument,
    _,
    { dataLoaders }: IContext
  ) {
    const tags = await dataLoaders.tag.loadMany(productTemplate.tagIds || []);
    return tags.filter(tag => tag);
  },

  async templateItemsProduct(productTemplate: IProductTemplateDocument, _) {
    const templateItems = productTemplate.templateItems;
    const productIds = templateItems.map(t => t.itemId);

    return await Products.find({ _id: { $in: productIds } }).lean();
  }
};
