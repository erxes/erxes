import {
  KnowledgeBaseArticles,
  KnowledgeBaseTopics,
  KnowledgeBaseCategories,
} from '../../models';
import { PUBLISH_STATUSES } from '../../models/definitions/constants';
import { ICategoryDocument } from '../../models/definitions/knowledgebase';
import { getDocumentList } from '../../cacheUtils';

export const KnowledgeBaseCategory = {
  articles(category: ICategoryDocument) {
    return KnowledgeBaseArticles.find({
      categoryId: category._id,
      status: PUBLISH_STATUSES.PUBLISH,
    }).sort({
      createdDate: -1,
    });
  },

  async authors(category: ICategoryDocument) {
    const articles = await KnowledgeBaseArticles.find(
      {
        categoryId: category._id,
        status: PUBLISH_STATUSES.PUBLISH,
      },
      { createdBy: 1 }
    );

    const authorIds = articles.map((article) => article.createdBy);

    return getDocumentList('users', {
      _id: { $in: authorIds },
    });
  },

  firstTopic(category: ICategoryDocument) {
    return KnowledgeBaseTopics.findOne({ _id: category.topicId });
  },

  numOfArticles(category: ICategoryDocument) {
    return KnowledgeBaseArticles.find({
      categoryId: category._id,
      status: PUBLISH_STATUSES.PUBLISH,
    }).countDocuments();
  },
};

export const KnowledgeBaseParentCategory = {
  ...KnowledgeBaseCategory,

  childrens(category: ICategoryDocument) {
    return KnowledgeBaseCategories.find({
      parentCategoryId: category._id,
    }).sort({ title: 1 });
  },
};
