import { checkPermission, requireLogin, paginate } from '@erxes/api-utils/src';

import { IContext } from '../../connectionResolver';

const findDetail = async (model, _id) => {
  let detail = await model.findOne({
    _id,
  });

  if (!detail) {
    detail = await model.findOne({
      code: _id,
    });
  }

  return detail;
};

const knowledgeBaseQueries = {
  /**
   * Article list
   */
  async knowledgeBaseArticles(
    _root,
    {
      categoryIds,
      searchValue,
      articleIds,
      codes,
      topicIds,
      ...pageArgs
    }: {
      page: number;
      perPage: number;
      searchValue?: string;
      categoryIds: string[];
      articleIds: string[];
      codes: string[];
      topicIds: string[];
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

    if (articleIds && articleIds.length > 0) {
      selector._id = { $in: articleIds };
    }

    if (codes && codes.length > 0) {
      selector.code = { $in: codes };
    }

    if (topicIds && topicIds.length > 0) {
      const categoryIds = await models.KnowledgeBaseCategories.find({
        topicId: { $in: topicIds },
      }).distinct('_id');

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
  async knowledgeBaseArticleDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return findDetail(models.KnowledgeBaseArticles, _id);
  },

  /**
   * Article detail anc increase a view count
   */
  knowledgeBaseArticleDetailAndIncViewCount(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
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
    args: { categoryIds: string[]; codes: string[] },
    { models }: IContext
  ) {
    const qry: any = {};

    if (args.categoryIds && args.categoryIds.length > 0) {
      qry.categoryId = { $in: args.categoryIds };
    }

    if (args.codes && args.codes.length > 0) {
      qry.code = { $in: args.codes };
    }

    return models.KnowledgeBaseArticles.find(qry).countDocuments();
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
      codes,
    }: { page: number; perPage: number; topicIds: string[]; codes: string[] },
    { models }: IContext
  ) {
    const qry: any = {};

    if (topicIds && topicIds.length > 0) {
      qry.topicId = { $in: topicIds };
    }

    if (codes && codes.length > 0) {
      qry.code = { $in: codes };
    }

    const categories = models.KnowledgeBaseCategories.find(qry).sort({
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
  async knowledgeBaseCategoryDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return findDetail(models.KnowledgeBaseCategories, _id);
  },

  /**
   * Category total count
   */
  async knowledgeBaseCategoriesTotalCount(
    _root,
    args: { topicIds: string[]; codes: string[] },
    { models }: IContext
  ) {
    const qry: any = {};

    if (args.topicIds && args.topicIds.length > 0) {
      qry.topicId = { $in: args.topicIds };
    }

    if (args.codes && args.codes.length > 0) {
      qry.code = { $in: args.codes };
    }

    return models.KnowledgeBaseCategories.find(qry).countDocuments();
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
    args: { page: number; perPage: number; brandId: string; codes: string[] },
    { commonQuerySelector, models }: IContext
  ) {
    const topics = models.KnowledgeBaseTopics.find({
      ...(args.brandId ? { brandId: args.brandId } : {}),
      ...(args.codes && args.codes.length > 0
        ? { code: { $in: args.codes } }
        : {}),
      ...commonQuerySelector,
    }).sort({ modifiedDate: -1 });

    return paginate(topics, args);
  },

  /**
   * Topic detail
   */
  async knowledgeBaseTopicDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return findDetail(models.KnowledgeBaseTopics, _id);
  },

  /**
   * Total topic count
   */
  knowledgeBaseTopicsTotalCount(
    _root,
    _args,
    { commonQuerySelector, models }: IContext
  ) {
    return models.KnowledgeBaseTopics.find(
      commonQuerySelector
    ).countDocuments();
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
