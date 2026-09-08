import { ITopicDocument } from '@/knowledgebase/@types/topic';
import { IContext } from '~/connectionResolvers';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Topic.findOne({ _id });
  },
  brand(topic: ITopicDocument) {
    if (!topic.brandId) {
      return null;
    }

    return {
      __typename: 'Brand',
      _id: topic.brandId,
    };
  },

  async categories(topic: ITopicDocument, _args, { models }: IContext) {
    return models.Category.find({ topicId: topic._id }).sort({
      title: 1,
    });
  },

  async parentCategories(topic: ITopicDocument, _args, { models }: IContext) {
    return models.Category.find({
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

  createdDate(topic: ITopicDocument) {
    return topic.createdDate || topic.createdAt;
  },
};
