import { Brands, KnowledgeBaseCategories } from '../../db/models';

export default {
  brand(topic) {
    return Brands.findOne({ _id: topic.brandId });
  },

  categories(topic) {
    return KnowledgeBaseCategories.find({ _id: { $in: topic.categoryIds } });
  },

  color(topic) {
    return topic.color ? topic.color : '';
  },
};
