import { KnowledgeBaseCategories } from '../../db/models';
import { ITopicDocument } from '../../db/models/definitions/knowledgebase';
import { getDocument } from './mutations/cacheUtils';

export default {
  brand(topic: ITopicDocument) {
    return getDocument('brands', { _id: topic.brandId });
  },

  categories(topic: ITopicDocument) {
    return KnowledgeBaseCategories.find({ _id: { $in: topic.categoryIds } });
  },

  color(topic: ITopicDocument) {
    return topic.color || '';
  }
};
