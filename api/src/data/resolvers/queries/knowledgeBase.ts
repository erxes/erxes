import {
  KnowledgeBaseArticles,
  KnowledgeBaseCategories,
  KnowledgeBaseTopics
} from '../../../db/models';

import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

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
    }
  ) {
    const selector: any = {};

    if (searchValue && searchValue.trim()) {
      selector.$or = [
        { title: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } },
        { content: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } },
        { summary: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } }
      ];
    }

    if (categoryIds && categoryIds.length > 0) {
      selector.categoryId = { $in: categoryIds };
    }

    const articles = KnowledgeBaseArticles.find(selector).sort({
      createdDate: -1
    });

    return paginate(articles, pageArgs);
  },

  /**
   * Article detail
   */
  knowledgeBaseArticleDetail(_root, { _id }: { _id: string }) {
    return KnowledgeBaseArticles.findOne({ _id });
  },

  /**
   * Article detail anc increase a view count
   */
  knowledgeBaseArticleDetailAndIncViewCount(_root, { _id }: { _id: string }) {
    return KnowledgeBaseArticles.findOneAndUpdate(
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
    args: { categoryIds: string[] }
  ) {
    return KnowledgeBaseArticles.find({
      categoryId: { $in: args.categoryIds }
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
      topicIds
    }: { page: number; perPage: number; topicIds: string[] }
  ) {
    const categories = KnowledgeBaseCategories.find({
      topicId: { $in: topicIds }
    }).sort({
      title: 1
    });

    if (!page && !perPage) {
      return categories;
    }

    return paginate(categories, { page, perPage });
  },

  /**
   * Category detail
   */
  knowledgeBaseCategoryDetail(_root, { _id }: { _id: string }) {
    return KnowledgeBaseCategories.findOne({ _id }).then(category => {
      return category;
    });
  },

  /**
   * Category total count
   */
  async knowledgeBaseCategoriesTotalCount(_root, args: { topicIds: string[] }) {
    return KnowledgeBaseCategories.find({
      topicId: { $in: args.topicIds }
    }).countDocuments();
  },

  /**
   * Get last category
   */
  knowledgeBaseCategoriesGetLast(
    _root,
    _args,
    { commonQuerySelector }: IContext
  ) {
    return KnowledgeBaseCategories.findOne(commonQuerySelector).sort({
      createdDate: -1
    });
  },

  /**
   * Topic list
   */
  knowledgeBaseTopics(
    _root,
    args: { page: number; perPage: number; brandId: string },
    { commonQuerySelector }: IContext
  ) {
    const topics = KnowledgeBaseTopics.find({
      ...(args.brandId ? { brandId: args.brandId } : {}),
      ...commonQuerySelector
    }).sort({ modifiedDate: -1 });

    return paginate(topics, args);
  },

  /**
   * Topic detail
   */
  knowledgeBaseTopicDetail(_root, { _id }: { _id: string }) {
    return KnowledgeBaseTopics.findOne({ _id });
  },

  /**
   * Total topic count
   */
  knowledgeBaseTopicsTotalCount(
    _root,
    _args,
    { commonQuerySelector }: IContext
  ) {
    return KnowledgeBaseTopics.find(commonQuerySelector).countDocuments();
  }
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
