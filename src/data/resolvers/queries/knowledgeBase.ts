import {
  KnowledgeBaseTopics,
  KnowledgeBaseCategories,
  KnowledgeBaseArticles,
} from '../../../db/models';

import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

/* Articles list & total count helper */
const articlesQuery = async ({ categoryIds }) => {
  const query = {};

  // filter articles by category id
  if (categoryIds) {
    const categories = await KnowledgeBaseCategories.find({
      _id: {
        $in: categoryIds,
      },
    });

    let articleIds = [];

    for (let category of categories) {
      articleIds = articleIds.concat(category.articleIds || []);
    }

    query._id = {
      $in: articleIds,
    };
  }

  return query;
};

/* Categories list & total count helper */
const categoriesQuery = async ({ topicIds }) => {
  const query = {};

  // filter categories by topic id
  if (topicIds) {
    let categoryIds = [];

    const topics = await KnowledgeBaseTopics.find({
      _id: {
        $in: topicIds,
      },
    });

    for (let topic of topics) {
      categoryIds = categoryIds.concat(topic.categoryIds || []);
    }

    query._id = {
      $in: categoryIds,
    };
  }

  return query;
};

const knowledgeBaseQueries = {
  /**
   * Article list
   * @param {Object} args - Search params
   * @return {Promise} sorted article list
   */
  async knowledgeBaseArticles(root, args) {
    const query = await articlesQuery(args);
    const articles = KnowledgeBaseArticles.find(query).sort({ createdData: -1 });

    return paginate(articles, args);
  },

  /**
   * Article detail
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} article detail
   */
  knowledgeBaseArticleDetail(root, { _id }) {
    return KnowledgeBaseArticles.findOne({ _id });
  },

  /**
   * Total article count
   * @return {Promise} article count
   */
  async knowledgeBaseArticlesTotalCount(root, args) {
    const query = await articlesQuery(args);

    return KnowledgeBaseArticles.find(query).count();
  },

  /**
   * Category list
   * @param {Object} args - Search params
   * @return {Promise} sorted category list
   */
  async knowledgeBaseCategories(root, args) {
    const query = await categoriesQuery(args);
    const categories = KnowledgeBaseCategories.find(query).sort({ modifiedDate: -1 });

    return paginate(categories, args);
  },

  /**
   * Category detail
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} category detail
   */
  knowledgeBaseCategoryDetail(root, { _id }) {
    return KnowledgeBaseCategories.findOne({ _id }).then(category => {
      return category;
    });
  },

  /**
   * Category total count
   * @return {Promise} category total count
   */
  async knowledgeBaseCategoriesTotalCount(root, args) {
    const query = await categoriesQuery(args);

    return KnowledgeBaseCategories.find(query).count();
  },

  /**
  * Get last category
  */
  knowledgeBaseCategoriesGetLast() {
    return KnowledgeBaseCategories.findOne({}).sort({ createdDate: -1 });
  },

  /**
   * Topic list
   * @param {Object} args - Search params
   * @return {Promise} sorted topic list
   */
  knowledgeBaseTopics(root, args) {
    const topics = paginate(KnowledgeBaseTopics.find({}), args);
    return topics.sort({ modifiedDate: -1 });
  },

  /**
   * Topic detail
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} topic detail
   */
  knowledgeBaseTopicDetail(root, { _id }) {
    return KnowledgeBaseTopics.findOne({ _id });
  },

  /**
   * Total topic count
   * @return {Promise} count
   */
  knowledgeBaseTopicsTotalCount() {
    return KnowledgeBaseTopics.find({}).count();
  },
};

moduleRequireLogin(knowledgeBaseQueries);

export default knowledgeBaseQueries;
