import { KnowledgeBaseCategories } from '../../db/models';
import { ITopicDocument } from '../../db/models/definitions/knowledgebase';
import { getDocument } from './mutations/cacheUtils';

export default {
  brand(topic: ITopicDocument) {
    return getDocument('brands', { _id: topic.brandId });
  },

  categories(topic: ITopicDocument) {
    return KnowledgeBaseCategories.find({ topicId: topic._id }).sort({
      modifiedDate: -1
    });
  },

  async parentCategories(topic: ITopicDocument) {
    return KnowledgeBaseCategories.find({
      topicId: topic._id,
      $or: [
        { parentCategoryId: null },
        { parentCategoryId: { $exists: false } },
        { parentCategoryId: '' }
      ]
    }).sort({
      modifiedDate: -1
    });
  },

  color(topic: ITopicDocument) {
    return topic.color || '';
  }
};
