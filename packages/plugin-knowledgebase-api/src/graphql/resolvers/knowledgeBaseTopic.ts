import { ITopicDocument } from '../../models/definitions/knowledgebase';
import { getDocument } from '../../cacheUtils';
import { IContext } from '../../connectionResolver';

export default {
  brand(topic: ITopicDocument, _args, { coreModels }: IContext) {
    return getDocument(coreModels, 'brands', { _id: topic.brandId });
  },

  categories(topic: ITopicDocument, _args, { models }: IContext) {
    return models.KnowledgeBaseCategories.find({ topicId: topic._id }).sort({
      title: 1,
    });
  },

  async parentCategories(topic: ITopicDocument, _args, { models }: IContext) {
    return models.KnowledgeBaseCategories.find({
      topicId: topic._id,
      $or: [
        { parentCategoryId: null },
        { parentCategoryId: { $exists: false } },
        { parentCategoryId: '' },
      ],
    }).sort({
      title: 1,
    });
  },

  color(topic: ITopicDocument) {
    return topic.color || '';
  },
};
