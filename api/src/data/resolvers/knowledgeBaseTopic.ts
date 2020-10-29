import { Brands, KnowledgeBaseCategories } from '../../db/models';
import { ITopicDocument } from '../../db/models/definitions/knowledgebase';

export default {
  brand(topic: ITopicDocument) {
    return Brands.findOne({ _id: topic.brandId });
  },

  categories(topic: ITopicDocument) {
    return KnowledgeBaseCategories.find({ _id: { $in: topic.categoryIds } });
  },

  color(topic: ITopicDocument) {
    return topic.color || '';
  }
};
