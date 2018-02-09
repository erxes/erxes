import { KnowledgeBaseArticles, KnowledgeBaseTopics } from '../../db/models';

export default {
  articles(category) {
    return KnowledgeBaseArticles.find({ _id: { $in: category.articleIds } });
  },

  firstTopic(category) {
    return KnowledgeBaseTopics.findOne({ categoryIds: { $in: [category._id] } });
  },
};
