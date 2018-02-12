import {
  KnowledgeBaseTopics,
  KnowledgeBaseCategories,
  KnowledgeBaseArticles,
} from '../../../db/models';

import { moduleRequireLogin } from '../../permissions';

const knowledgeBaseMutations = {
  /**
   * Create topic document
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {KnowledgeBaseTopic} object2.doc - KnowledgeBaseTopic object
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise} - returns Promise resolving created document
   */
  knowledgeBaseTopicsAdd(root, { doc }, { user }) {
    return KnowledgeBaseTopics.createDoc(doc, user._id);
  },

  /**
   * Update topic document
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {string} object2._id - KnowledgeBaseTopic document id
   * @param {KnowledgeBaseTopic} object2.doc - KnowledgeBaseTopic object
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise} - returns Promise resolving modified document
   */
  knowledgeBaseTopicsEdit(root, { _id, doc }, { user }) {
    return KnowledgeBaseTopics.updateDoc(_id, doc, user._id);
  },

  /**
   * Remove topic document
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {string} object2._id - KnowledgeBaseTopic document id
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise}
   */
  knowledgeBaseTopicsRemove(root, { _id }) {
    return KnowledgeBaseTopics.removeDoc(_id);
  },

  /**
   * Create category document
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {KnowledgeBaseCategory} object2.doc - KnowledgeBaseCategory object
   * @param {String[]} object2.topicIds - KnowledgeBaseTopic ids
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise} - returns Promise resolving created document
   */
  knowledgeBaseCategoriesAdd(root, { doc }, { user }) {
    return KnowledgeBaseCategories.createDoc(doc, user._id);
  },

  /**
   * Update category document
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {string} object2._id - KnowledgeBaseCategory document id
   * @param {KnowledgeBaseCategory} object2.doc - KnowledgeBaseCategory object
   * @param {String[]} object2.topicIds - KnowledgeBaseTopic ids
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise} - returns Promise resolving modified document
   */
  knowledgeBaseCategoriesEdit(root, { _id, doc }, { user }) {
    return KnowledgeBaseCategories.updateDoc(_id, doc, user._id);
  },

  /**
   * Remove category document
   * @param {Object} root
   * @param {Object} doc - KnowledgeBaseCategory object
   * @param {string} doc._id - KnowledgeBaseCategory document id
   * @param {Object} object3 - Graphql input data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise}
   */
  knowledgeBaseCategoriesRemove(root, { _id }) {
    return KnowledgeBaseCategories.removeDoc(_id);
  },

  /**
   * Create article document
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {KnowledgeBaseArticle} object2.doc - KnowledgeBaseCategory object
   * @param {String[]} object2.categoryIds - KnowledgeBaseCategory ids
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise} - returns Promise resolving created document
   */
  knowledgeBaseArticlesAdd(root, { doc }, { user }) {
    return KnowledgeBaseArticles.createDoc(doc, user._id);
  },

  /**
   * Update article document
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {string} object2._id - KnowledgeBaseArticle document id
   * @param {KnowledgeBaseArticle} object2.doc - KnowledgeBaseArticle object
   * @param {String[]} object2.categoryIds - KnowledgeBaseCategory ids
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise} - returns Promise resolving modified document
   */
  knowledgeBaseArticlesEdit(root, { _id, doc }, { user }) {
    return KnowledgeBaseArticles.updateDoc(_id, doc, user._id);
  },

  /**
   * Remove article document
   * @param {Object} root
   * @param {Object} object2 - KnowledgeBaseArticle object
   * @param {string} object2._id - KnowledgeBaseArticle document id
   * @param {Object} object3 - Graphql input data
   * @param {Object} object3.user - User object supplied by middleware
   * @return {Promise}
   */
  knowledgeBaseArticlesRemove(root, { _id }) {
    return KnowledgeBaseArticles.removeDoc(_id);
  },
};

moduleRequireLogin(knowledgeBaseMutations);

export default knowledgeBaseMutations;
