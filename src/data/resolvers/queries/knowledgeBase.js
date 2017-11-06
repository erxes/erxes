import {
  KnowledgeBaseTopics,
  KnowledgeBaseCategories,
  KnowledgeBaseArticles,
} from '../../../db/models';

import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const knowledgeBaseQueries = {
  /**
   * Article list
   * @param {Object} params - Search params
   * @return {Promise} sorted article list
   */
  knowledgeBaseArticles(root, { params }) {
    const articles = paginate(KnowledgeBaseArticles.find({}), params);
    return articles.sort({ createdDate: -1 });
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
  knowledgeBaseArticlesTotalCount() {
    return KnowledgeBaseArticles.find({}).count();
  },

  /**
   * Category list
   * @param {Object} params - Search params
   * @return {Promise} sorted category list
   */
  knowledgeBaseCategories(root, { params }) {
    const categories = paginate(KnowledgeBaseCategories.find({}), params);
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
   * Topic list
   * @param {Object} params - Search params
   * @return {Promise} sorted topic list
   */
  knowledgeBaseTopics(root, { params }) {
    const topics = paginate(KnowledgeBaseTopics.find({}), params);
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
