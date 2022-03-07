import {
  checkPermission,
  requireLogin,
  paginate,
} from '@erxes/api-utils/src';

import { IContext } from '../../connectionResolver';

const knowledgeBaseQueries = {
  /**
   * Article list
   */
  async knowledgeBaseArticles(
    _root,
    {
      categoryIds,
      searchValue,
      ...pageArgs
    }: {
      page: number;
      perPage: number;
      searchValue?: string;
      categoryIds: string[];
    },
    { models }: IContext
  ) {
    const selector: any = {};

    if (searchValue && searchValue.trim()) {
      selector.$or = [
        { title: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } },
        { content: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } },
        { summary: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } },
      ];
    }

    if (categoryIds && categoryIds.length > 0) {
      selector.categoryId = { $in: categoryIds };
    }

    const articles = models.KnowledgeBaseArticles.find(selector).sort({
      createdDate: -1,
    });

    return paginate(articles, pageArgs);
  },

  /**
   * Article detail
   */
  knowledgeBaseArticleDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.KnowledgeBaseArticles.findOne({ _id });
  },

  /**
   * Article detail anc increase a view count
   */
  knowledgeBaseArticleDetailAndIncViewCount(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.KnowledgeBaseArticles.findOneAndUpdate(
      { _id },
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  },

  /**
   * Total article count
   */
  async knowledgeBaseArticlesTotalCount(
    _root,
    args: { categoryIds: string[] }, { models }: IContext
  ) {
    return models.KnowledgeBaseArticles.find({
      categoryId: { $in: args.categoryIds },
    }).countDocuments();
  },

  /**
   * Category list
   */
  async knowledgeBaseCategories(
    _root,
    {
      page,
      perPage,
      topicIds,
    }: { page: number; perPage: number; topicIds: string[] }, { models }: IContext
  ) {
    const categories = models.KnowledgeBaseCategories.find({
      topicId: { $in: topicIds },
    }).sort({
      title: 1,
    });

    if (!page && !perPage) {
      return categories;
    }

    return paginate(categories, { page, perPage });
  },

  /**
   * Category detail
   */
  knowledgeBaseCategoryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.KnowledgeBaseCategories.findOne({ _id }).then((category) => {
      return category;
    });
  },

  /**
   * Category total count
   */
  async knowledgeBaseCategoriesTotalCount(_root, args: { topicIds: string[] }, { models }: IContext) {
    return models.KnowledgeBaseCategories.find({
      topicId: { $in: args.topicIds },
    }).countDocuments();
  },

  /**
   * Get last category
   */
  knowledgeBaseCategoriesGetLast(
    _root,
    _args,
    { commonQuerySelector, models }: IContext
  ) {
    return models.KnowledgeBaseCategories.findOne(commonQuerySelector).sort({
      createdDate: -1,
    });
  },

  /**
   * Topic list
   */
  knowledgeBaseTopics(
    _root,
    args: { page: number; perPage: number; brandId: string },
    { commonQuerySelector, models }: IContext
  ) {
    const topics = models.KnowledgeBaseTopics.find({
      ...(args.brandId ? { brandId: args.brandId } : {}),
      ...commonQuerySelector,
    }).sort({ modifiedDate: -1 });

    return paginate(topics, args);
  },

  /**
   * Topic detail
   */
  knowledgeBaseTopicDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.KnowledgeBaseTopics.findOne({ _id });
  },

  /**
   * Total topic count
   */
  knowledgeBaseTopicsTotalCount(
    _root,
    _args,
    { commonQuerySelector, models }: IContext
  ) {
    return models.KnowledgeBaseTopics.find(commonQuerySelector).countDocuments();
  },
};

requireLogin(knowledgeBaseQueries, 'knowledgeBaseArticlesTotalCount');
requireLogin(knowledgeBaseQueries, 'knowledgeBaseTopicsTotalCount');
requireLogin(knowledgeBaseQueries, 'knowledgeBaseCategoriesGetLast');
requireLogin(knowledgeBaseQueries, 'knowledgeBaseCategoriesTotalCount');

checkPermission(
  knowledgeBaseQueries,
  'knowledgeBaseArticles',
  'showKnowledgeBase',
  []
);
checkPermission(
  knowledgeBaseQueries,
  'knowledgeBaseTopics',
  'showKnowledgeBase',
  []
);
checkPermission(
  knowledgeBaseQueries,
  'knowledgeBaseCategories',
  'showKnowledgeBase',
  []
);

export default knowledgeBaseQueries;
