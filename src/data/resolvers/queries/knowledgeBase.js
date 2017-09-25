import {
  KnowledgeBaseTopics,
  KnowledgeBaseCategories,
  KnowledgeBaseArticles,
} from '../../../db/models';

export default {
  /**
   * Article list
   * @param {Object} args
   * @param {Integer} args.limit
   * @return {Promise} sorted article list
   */
  knowledgeBaseArticles(root, { limit }) {
    const articles = KnowledgeBaseArticles.find({});
    const sort = { createdDate: -1 };

    if (limit) {
      return articles.sort(sort).limit(limit);
    }

    return articles.sort(sort);
  },

  /**
   * Article detail
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} article detail
   */
  knowledgeBaseArticlesDetail(root, { _id }) {
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
   * @param {Object} args
   * @param {Integer} args.limit
   * @return {Promise} sorted category list
   */
  knowledgeBaseCategories(root, { limit }) {
    const categories = KnowledgeBaseCategories.find({});
    const sort = { createdDate: -1 };

    if (limit) {
      return categories.sort(sort).limit(limit);
    }

    return categories.sort(sort);
  },

  /**
   * Category detail
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} category detail
   */
  knowledgeBaseCategoriesDetail(root, { _id }) {
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
   * @param {Object} args
   * @param {Integer} args.limit
   * @return {Promise} sorted topic list
   */
  knowledgeBaseTopics(root, { limit }) {
    const topics = KnowledgeBaseTopics.find({});
    const sort = { createdDate: -1 };

    if (limit) {
      return topics.sort(sort).limit(limit);
    }

    return topics.sort(sort);
  },

  /**
   * Topic detail
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} topic detail
   */
  knowledgeBaseTopicsDetail(root, { _id }) {
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
