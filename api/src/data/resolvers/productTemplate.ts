import { IProductTemplateDocument } from '../../db/models/definitions/productTemplates';
import { IContext } from '../types';

export default {
  async tags(productTemplate: IProductTemplateDocument, _, { dataLoaders }: IContext) {
    const tags = await dataLoaders.tag.loadMany(productTemplate.tagIds || []);
    return tags.filter(tag => tag);
  }
};
