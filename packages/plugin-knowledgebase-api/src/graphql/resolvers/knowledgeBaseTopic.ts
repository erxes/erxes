import { ITopicDocument } from '../../models/definitions/knowledgebase';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.KnowledgeBaseTopics.findOne({ _id });
  },
  
  brand(topic: ITopicDocument) {
    return (
      topic.brandId && {
        __typename: 'Brand',
        _id: topic.brandId
      }
    );

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
