import mongoose from 'mongoose';
import Random from 'meteor-random';
import { PUBLISH_STATUSES } from '../../data/constants';

// Schema for common fields
const commonFields = {
  createdBy: String,
  createdDate: {
    type: Date,
    default: new Date(),
  },
  modifiedBy: String,
  modifiedDate: Date,
};

/**
 * Base class for Knowledge base classes
 */
class KnowledgeBaseCommonDocument {
  /**
   * Create document with given parameters, also set createdBy by given
   * userId and also check if its supplied
   * @param {Object} doc - Knowledge base document object
   * @param {string} userId - User id of the creator of this document
   * @return {Promise} - returns Promise resolving newly added document
   * @throws {Error} - throws Error('userId must be supplied') if the userId is not supplied
   */
  static createDoc(doc, userId) {
    if (!userId) {
      throw new Error('userId must be supplied');
    }

    return this.create({
      ...doc,
      createdBy: userId,
    });
  }

  /**
   * Update knowledge base document
   * @param {string} - Id of the document
   * @param {Object} - Document Object
   * @param {string} - The user id of the modifier
   * @return {Promsie} - returns Promise resolving updated document
   */
  static async updateDoc(_id, doc, userId) {
    if (!userId) {
      throw new Error('userId must be supplied');
    }

    await this.update(
      { _id },
      {
        $set: {
          ...doc,
          modifiedBy: userId,
          modifiedDate: new Date(),
        },
      },
    );

    return this.findOne({ _id });
  }

  /**
   * Removed document
   * @param {string} _id - Document id
   * @return {Promise}
   */
  static removeDoc(_id) {
    return this.remove({ _id });
  }
}

const ArticleSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  title: {
    type: String,
    required: true,
  },
  summary: String,
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: PUBLISH_STATUSES.ALL,
    default: PUBLISH_STATUSES.DRAFT,
    required: true,
  },
  ...commonFields,
});

class Article extends KnowledgeBaseCommonDocument {
  /**
   * Create KnowledgeBaseArticle document
   * @param {Object} doc - KnowledgeBaseArticle object
   * @param {string} doc.title - KnowledgeBaseArticle title
   * @param {string} doc.summary - KnowledgeBaseArticle summary
   * @param {string} doc.content - KnowledgeBaseArticle content
   * @param {string} doc.status - KnowledgeBaseArticle status (currently: 'draft' or 'publish')
   * @param {string} userId - User id of the creator of this document
   * @return {Promise} - returns Promise resolving created document
   */
  static createDoc(doc, userId) {
    return super.createDoc(doc, userId);
  }

  /**
   * Update KnowledgeBaseArticle document
   * @param {Object} _id - KnowldegeBaseArticle document id
   * @param {Object} doc - KnowledgeBaseArticle object
   * @param {string} doc.title - KnowledgeBaseArticle title
   * @param {string} doc.summary - KnowledgeBaseArticle summary
   * @param {string} doc.content - KnowledgeBaseArticle content
   * @param {string} doc.status - KnowledgeBaseArticle status (currently: 'draft' or 'publish')
   * @param {string} userId - User id of the modifier of this document
   * @return {Promise} - returns Promise resolving modified document
   */
  static updateDoc(_id, doc, userId) {
    return super.updateDoc({ _id }, doc, userId);
  }

  /**
   * Removes KnowledgeBaseArticle document
   * @param {Object} _id - KnowldegeBaseArticle document id
   * @return {Promise}
   * @throws {Error} - Thrwos Error('You can not delete this. This article is used in category.')
   * if there are categories using this article
   */
  static async removeDoc(_id) {
    if ((await KnowledgeBaseCategories.find({ articleIds: _id }).count()) > 0) {
      throw new Error('You can not delete this. This article is used in category.');
    }

    return this.remove({ _id });
  }
}

const CategorySchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  articleIds: {
    type: [String],
    required: false,
  },
  icon: {
    type: String,
    required: true,
  },
  ...commonFields,
});

class Category extends KnowledgeBaseCommonDocument {
  /**
   * Create KnowledgeBaseCategory document
   * @param {Object} doc - KnowledgeBaseCategory object
   * @param {string} doc.title - KnowledgeBaseCategory title
   * @param {string} doc.description - KnowledgeBaseCategory description
   * @param {string[]} doc.articleIds - KnowledgeBaseCategory articleIds
   * @param {string} doc.icon - Select icon name
   * @param {string} userId - User id of the creator of this document
   * @return {Promise} - returns Promise resolving created document
   */
  static createDoc({ createdBy, createdDate, modifiedBy, modifiedDate, ...docFields }, userId) {
    return super.createDoc(docFields, userId);
  }

  /**
   * Update KnowledgeBaseCategory document
   * @param {Object} _id - KnowledgeBaseCategory document id
   * @param {Object} doc - KnowledgeBaseCategory object
   * @param {string} doc.title - KnowledgeBaseCategory title
   * @param {string} doc.description - KnowledgeBaseCategory description
   * @param {string[]} doc.articleIds - KnowledgeBaseCategory articleIds
   * @param {string} doc.icon - Select icon name
   * @param {string} userId - User id of the modifier of this document
   * @return {Promise} - returns Promise resolving modified document
   */
  static updateDoc(
    _id,
    { createdBy, createdDate, modifiedBy, modifiedDate, ...docFields },
    userId,
  ) {
    return super.updateDoc(_id, docFields, userId);
  }

  /**
   * Removes KnowledgeBaseCategory document
   * @param {Object} _id - KnowledgeBaseCategory document id
   * @return {Promise}
   * @throws {Error} - Thrwos Error('You can not delete this. This category is used in topic.')
   * if there are topics using this category
   */
  static async removeDoc(_id) {
    if ((await KnowledgeBaseTopics.find({ categoryIds: _id }).count()) > 0) {
      throw new Error('You can not delete this. This category is used in topic.');
    }

    return this.remove({ _id });
  }
}

const TopicSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  brandId: {
    type: String,
    required: true,
    validate: /\S+/,
  },
  categoryIds: {
    type: [String],
    required: false,
  },
  ...commonFields,
});

class Topic extends KnowledgeBaseCommonDocument {
  /**
   * Create KnowledgeBaseTopic document
   * @param {Object} doc - KnowledgeBaseTopic object
   * @param {string} doc.title - KnowledgeBaseTopic title
   * @param {string} doc.description - KnowledgeBaseTopic description
   * @param {string[]} doc.categoryIds - KnowledgeBaseTopic category ids
   * @param {string} doc.brandId - Id of the brand related to this topic
   * @param {string} userId - User id of the creator of this document
   * @return {Promise} - returns Promise resolving created document
   */
  static createDoc({ createdBy, createdDate, modifiedBy, modifiedDate, ...docFields }, userId) {
    return super.createDoc(docFields, userId);
  }

  /**
   * Update KnowledgeBaseTopic document
   * @param {Object} _id - KnowledgeBaseTopic document id
   * @param {Object} doc - KnowledgeBaseTopic object
   * @param {string} doc.title - KnowledgeBaseTopic title
   * @param {string} doc.description - KnowledgeBaseTopic description
   * @param {string[]} doc.categoryIds - KnowledgeBaseTopic category ids
   * @param {string} doc.brandId - Id of the brand related to this topic
   * @param {string} userId - User id of the modifier of this document
   * @return {Promise} - returns Promise resolving modified document
   */
  static updateDoc(
    _id,
    { createdBy, createdDate, modifiedBy, modifiedDate, ...docFields },
    userId,
  ) {
    return super.updateDoc(_id, docFields, userId);
  }
}

ArticleSchema.loadClass(Article);
export const KnowledgeBaseArticles = mongoose.model('knowledgebase_articles', ArticleSchema);

CategorySchema.loadClass(Category);
export const KnowledgeBaseCategories = mongoose.model('knowledgebase_categories', CategorySchema);

TopicSchema.loadClass(Topic);
export const KnowledgeBaseTopics = mongoose.model('knowledgebase_topics', TopicSchema);
