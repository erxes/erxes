import {
  KnowledgeBaseTopics,
  KnowledgeBaseCategories,
  KnowledgeBaseArticles,
} from '../../../db/models';

export default {
  /**
   * Create topic document
   * @param {Object} root
   * @param {KnowledgeBaseTopic} doc - KnowledgeBaseTopic object
   * @param {Object} object3 - Graphql input data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise} - returns Promise resolving created document
   * @throws {Error} - throws Error('Login required') if user object is not supplied
   */
  knowledgeBaseTopicsAdd(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseTopics.createDoc(doc, user._id);
  },

  /**
   * Update topic document
   * @param {Object} root
   * @param {KnowledgeBaseTopic} doc - KnowledgeBaseTopic object
   * @param {string} doc._id - KnowledgeBaseTopic document id
   * @param {Object} object3 - Graphql input data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise} - returns Promise resolving modified document
   * @throws {Error} - throws Error('Login required') if user object is not supplied
   */
  knowledgeBaseTopicsEdit(root, { _id, ...fields }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseTopics.updateDoc(_id, fields, user._id);
  },

  /**
   * Remove topic document
   * @param {Object} root
   * @param {Object} doc - KnowledgeBaseTopic object
   * @param {string} doc._id - KnowledgeBaseTopic document id
   * @param {Object} object3 - Graphql input data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise}
   * @throws {Error} - throws Error('Login required') if user object is not supplied
   */
  knowledgeBaseTopicsRemove(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseTopics.removeDoc(_id);
  },

  /**
   * Create category document
   * @param {Object} root
   * @param {KnowledgeBaseCategory} doc - KnowledgeBaseCategory object
   * @param {Object} object3 - Graphql input data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise} - returns Promise resolving created document
   * @throws {Error} - throws Error('Login required') if user object is not supplied
   */
  knowledgeBaseCategoriesAdd(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseCategories.createDoc(doc, user._id);
  },

  /**
   * Update category document
   * @param {Object} root
   * @param {KnowledgeBaseCategory} doc - KnowledgeBaseCategory object
   * @param {string} doc._id - KnowledgeBaseCategory document id
   * @param {Object} object3 - Graphql input data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise} - returns Promise resolving modified document
   * @throws {Error} - throws Error('Login required') if user object is not supplied
   */
  knowledgeBaseCategoriesEdit(root, { _id, ...fields }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseCategories.updateDoc(_id, fields, user._id);
  },

  /**
   * Remove category document
   * @param {Object} root
   * @param {Object} doc - KnowledgeBaseCategory object
   * @param {string} doc._id - KnowledgeBaseCategory document id
   * @param {Object} object3 - Graphql input data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise}
   * @throws {Error} - throws Error('Login required') if user object is not supplied
   */
  knowledgeBaseCategoriesRemove(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseCategories.removeDoc(_id);
  },

  /**
   * Create article document
   * @param {Object} root
   * @param {KnowledgeBaseArticle} doc - KnowledgeBasecategory object
   * @param {Object} object3 - Graphql input data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise} - returns Promise resolving created document
   * @throws {Error} - throws Error('Login required') if user object is not supplied
   */
  knowledgeBaseArticlesAdd(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseArticles.createDoc(doc, user._id);
  },

  /**
   * Update article document
   * @param {Object} root
   * @param {KnowledgeBaseArticle} doc - KnowledgeBaseArticle object
   * @param {string} doc._id - KnowledgeBaseArticle document id
   * @param {Object} object3 - Graphql input data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise} - returns Promise resolving modified document
   * @throws {Error} - throws Error('Login required') if user object is not supplied
   */
  knowledgeBaseArticlesEdit(root, { _id, ...fields }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseArticles.updateDoc(_id, fields, user._id);
  },

  /**
   * Remove article document
   * @param {Object} root
   * @param {Object} doc - KnowledgeBaseArticle object
   * @param {string} doc._id - KnowledgeBaseArticle document id
   * @param {Object} object3 - Graphql input data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise}
   * @throws {Error} - throws Error('Login required') if user object is not supplied
   */
  knowledgeBaseArticlesRemove(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseArticles.removeDoc(_id);
  },
};
