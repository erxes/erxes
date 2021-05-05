import {
  KnowledgeBaseArticles,
  KnowledgeBaseCategories,
  KnowledgeBaseTopics
} from '../../../db/models';

import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

/* Articles list & total count helper */
const articlesQuery = async ({ categoryIds }: { categoryIds: string[] }) => {
  const query: any = {};

  // filter articles by category i
  if (categoryIds) {
    const categories = await KnowledgeBaseCategories.find({
      _id: {
        $in: categoryIds
      }
    });

    let articleIds: any = [];

    for (const category of categories) {
      articleIds = articleIds.concat(category.articleIds || []);
    }

    query._id = {
      $in: articleIds
    };
  }

  return query;
};

/* Categories list & total count helper */
const categoriesQuery = async ({ topicIds }: { topicIds: string[] }) => {
  const query: any = {};

  // filter categories by topic id
  if (topicIds) {
    let categoryIds: any = [];

    const topics = await KnowledgeBaseTopics.find({
      _id: {
        $in: topicIds
      }
    });

    for (const topic of topics) {
      categoryIds = categoryIds.concat(topic.categoryIds || []);
    }

    query._id = {
      $in: categoryIds
    };
  }

  return query;
};

const knowledgeBaseQueries = {
  /**
   * Article list
   */
  async knowledgeBaseArticles(
    _root,
    args: { page: number; perPage: number; categoryIds: string[] }
  ) {
    const query = await articlesQuery(args);

    const articles = KnowledgeBaseArticles.find(query).sort({
      createdData: -1
    });

    return paginate(articles, args);
  },

  /**
   * Article detail
   */
  knowledgeBaseArticleDetail(_root, { _id }: { _id: string }) {
    return KnowledgeBaseArticles.findOne({ _id });
  },

  /**
   * Total article count
   */
  async knowledgeBaseArticlesTotalCount(
    _root,
    args: { categoryIds: string[] }
  ) {
    const query = await articlesQuery(args);

    return KnowledgeBaseArticles.find(query).countDocuments();
  },

  /**
   * Category list
   */
  async knowledgeBaseCategories(
    _root,
    args: { page: number; perPage: number; topicIds: string[] }
  ) {
    const query = await categoriesQuery(args);

    const categories = KnowledgeBaseCategories.find(query).sort({
      modifiedDate: -1
    });

    if (!args.page && !args.perPage) {
      return categories;
    }

    return paginate(categories, args);
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
    const query = await categoriesQuery(args);

    return KnowledgeBaseCategories.find(query).countDocuments();
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
    args: { page: number; perPage: number },
    { commonQuerySelector }: IContext
  ) {
    const topics = paginate(
      KnowledgeBaseTopics.find(commonQuerySelector),
      args
    );
    return topics.sort({ modifiedDate: -1 });
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
