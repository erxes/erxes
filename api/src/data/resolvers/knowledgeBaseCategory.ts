import { KnowledgeBaseArticles, KnowledgeBaseTopics } from '../../db/models';
import { PUBLISH_STATUSES } from '../../db/models/definitions/constants';
import { ICategoryDocument } from '../../db/models/definitions/knowledgebase';
import { getDocumentList } from './mutations/cacheUtils';

export default {
  articles(category: ICategoryDocument) {
    return KnowledgeBaseArticles.find({
      _id: { $in: category.articleIds },
      status: PUBLISH_STATUSES.PUBLISH
    });
  },

  async authors(category: ICategoryDocument) {
    const articles = await KnowledgeBaseArticles.find(
      {
        _id: { $in: category.articleIds },
        status: PUBLISH_STATUSES.PUBLISH
      },
      { createdBy: 1 }
    );

    const authorIds = articles.map(article => article.createdBy);

    return getDocumentList('users', {
      _id: { $in: authorIds }
    });
  },

  firstTopic(category: ICategoryDocument) {
    return KnowledgeBaseTopics.findOne({
      categoryIds: { $in: [category._id] }
    });
  },

  numOfArticles(category: ICategoryDocument) {
    return KnowledgeBaseArticles.find({
      _id: { $in: category.articleIds },
      status: PUBLISH_STATUSES.PUBLISH
    }).countDocuments();
  }
};
