import { KnowledgeBaseArticles, KnowledgeBaseTopics } from '../../db/models';
import { ICategoryDocument } from '../../db/models/definitions/knowledgebase';

export default {
  articles(category: ICategoryDocument) {
    return KnowledgeBaseArticles.find({ _id: { $in: category.articleIds } });
  },

  firstTopic(category: ICategoryDocument) {
    return KnowledgeBaseTopics.findOne({
      categoryIds: { $in: [category._id] },
    });
  },
};
