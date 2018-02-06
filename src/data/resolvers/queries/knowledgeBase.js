import {
  KnowledgeBaseTopics,
  KnowledgeBaseCategories,
  KnowledgeBaseArticles,
} from '../../../db/models';

import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

/*
 * Articles list & total count helper
 */
const articlesQuery = async ({ categoryId }) => {
  const query = {};

  // filter articles by category id
  if (categoryId) {
    const category = await KnowledgeBaseCategories.findOne({ _id: categoryId });
    query._id = { $in: category.articleIds || [] };
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
    const articles = KnowledgeBaseArticles.find(query).sort({ createdDate: -1 });

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
  knowledgeBaseCategories(root, args) {
    const categories = paginate(KnowledgeBaseCategories.find({}), args);
    return categories.sort({ createdDate: -1 });
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
  knowledgeBaseCategoriesTotalCount() {
    return KnowledgeBaseCategories.find({}).count();
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
    return topics.sort({ createdDate: -1 });
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
