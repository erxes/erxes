import { ITopicDocument } from '@/knowledgebase/@types/knowledgebase';
import { IContext } from '~/connectionResolvers';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.KnowledgeBaseTopics.findOne({ _id });
  },

  brand(topic: ITopicDocument) {
    return topic.brandId ? { _id: topic.brandId, typeName: 'Brand' } : null;
  },

  async categories(topic: ITopicDocument, _args, { models }: IContext) {
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
