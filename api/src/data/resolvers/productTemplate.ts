import { Products } from '../../db/models';
import { IProductTemplateDocument } from '../../db/models/definitions/productTemplates';
import { IContext } from '../types';

export default {
  async tags(productTemplate: IProductTemplateDocument, _, { dataLoaders }: IContext) {
    const tags = await dataLoaders.tag.loadMany(productTemplate.tagIds || []);
    return tags.filter(tag => tag);
  },
  async templateItemsProduct( productTemplate: IProductTemplateDocument, _) {
    const templateItems = productTemplate.templateItems;
    const withProduct : any[] = [];

    for (const templateItem of templateItems) {
      const product = await Products.findOne({_id : templateItem.itemId});
      withProduct.push({ discount: templateItem.discount, quantity: templateItem.quantity, product: product });
    }

    return withProduct;
  }
};
