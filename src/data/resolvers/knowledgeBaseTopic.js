import { Brands, KnowledgeBaseCategories } from '../../db/models';

export default {
  brand(topic) {
    return Brands.findOne(topic.brandId);
  },

  categories(topic) {
    return KnowledgeBaseCategories.find({ _id: topic.categoryIds });
  },
};
